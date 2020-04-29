<template>
  <div class="widget-disk-usage-details">
    <div class="bg-light py-3 px-4 d-flex flex-row text-nowrap">
      <widget-disk-usage-details-tree :path="path" @input="$emit('input', $event)" />
      <transition name="fade">
        <div v-if="total >= 0 && !$wait.waiting('disk usage details')">
          <fa icon="weight" />
          {{ humanSize(total, false, $t('human.size')) }}
        </div>
      </transition>
    </div>
    <v-wait for="disk usage details" transition="fade">
      <div slot="waiting" class="p-4 text-center">
        <fa icon="circle-notch" spin size="2x" />
      </div>
      <div>
        <ul class="list-group list-group-flush widget-disk-usage-details__directories">
          <li v-for="directory in directories" :key="directory.key" class="list-group-item d-flex flex-row widget-disk-usage-details__directories__item">
            <a class="flex-grow-1" href @click.prevent="$emit('input', directory.key)">
              {{ directory.key | basename  }}
            </a>
            <span class="font-weight-bold" :title="directory.contentLength.value">
              {{ humanSize(directory.contentLength.value, false, $t('human.size'))  }}
            </span>
            <span class="widget-disk-usage-details__directories__item__bar" :style="{ width: totalPercentage(directory.contentLength.value) }"></span>
          </li>
          <li class="list-group-item widget-disk-usage-details__directories__item widget-disk-usage-details__directories__item--hits" :title="$tc('widget.diskUsage.hits', hits, { hits })">
            {{ $tc('widget.diskUsage.hits', hits, { hits: humanNumber(hits, $t('human.number')) }) }}
          </li>
        </ul>
      </div>
    </v-wait>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import { waitFor } from 'vue-wait'
import { basename } from 'path'
import { round } from 'lodash'

import elasticsearch from '@/api/elasticsearch'
import humanSize from '@/filters/humanSize'
import humanNumber from '@/filters/humanNumber'
import WidgetDiskUsageDetailsTree from '@/components/WidgetDiskUsageDetailsTree.vue'

export default {
  name: 'WidgetDiskUsageDetails',
  model: {
    prop: 'path',
    event: 'input'
  },
  props: {
    path: {
      type: String
    }
  },
  components: {
    WidgetDiskUsageDetailsTree
  },
  data () {
    return {
      total: -1,
      hits: 0,
      directories: []
    }
  },
  async created () {
    Object.assign(this, await this.loadData())
  },
  watch: {
    async path () {
      Object.assign(this, await this.loadData())
    }
  },
  filters: {
    basename
  },
  computed: {
    sumOptions () {
      return {
        include: `${this.path}/.*`,
        exclude: `${this.path}/.*/.*`,
        order: { contentLength: 'desc' },
        size: 1000
      }
    },
    bodybuilderBase () {
      return bodybuilder()
        // Returns no documents
        .size(0)
        // Only documents...
        .andQuery('match', 'type', 'Document')
        // ...on disk
        .andQuery('match', 'extractionLevel', 0)
        // On a specific directory
        .andFilter('term', 'dirname.tree', this.path)
        // Aggregate by dirname entry
        .agg('terms', 'dirname.tree', this.sumOptions, 'byDirname', b => {
          // Create a sub-aggregation to sum the contentLength
          return b.agg('sum', 'contentLength', 'contentLength')
        })
        // Calculate the total size
        .aggregation('sum', 'contentLength', 'totalContentLength')
    }
  },
  methods: {
    humanSize,
    humanNumber,
    totalPercentage (value) {
      if (this.total > 0) {
        return `${round(value / this.total * 100, 2)}%`
      } else {
        return '0%'
      }
    },
    loadData: waitFor('disk usage details', async function () {
      const index = this.$store.state.insights.project
      const body = this.bodybuilderBase.build()
      const res = await elasticsearch.search({ index, body, size: 0 })
      const directories = res?.aggregations?.byDirname?.buckets || []
      const hits = res?.hits?.total || 0
      const total = res?.aggregations?.totalContentLength?.value || 0
      return { directories, hits, total }
    })
  }
}
</script>

<style lang="scss">
  @keyframes slidingBar {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(0%);
    }
  }

  .widget-disk-usage-details {
      overflow: hidden;

      .fade-enter-active,
      .fade-leave-active {
        transition: opacity .5s;
      }
      .fade-enter,
      .fade-leave-to {
        opacity: 0;
      }

      &__directories {

        &__item {
          position: relative;

          &__bar {
            position: absolute;
            left: 0;
            bottom: 0;
            height: 3px;
            background: $primary;
            transform: translateX(-100%);
            animation: slidingBar 200ms forwards;
          }

          @for $i from 0 through 100 {
            &:nth-child(#{$i}) &__bar {
              animation-delay: $i * 50ms;
            }
          }
        }
      }
  }
</style>
