<template>
  <div class="widget-disk-usage-details">
    <div class="bg-light py-3 px-4 d-flex flex-row text-nowrap">
      <widget-disk-usage-details-tree :path="path" @input="$emit('input', $event)" />
      <div v-if="total > 0">
        <fa icon="weight" />
        {{ humanSize(total, false, $t('human.size')) }}
      </div>
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
            <span class="font-weight-bold" :title="directory.contentLengthSum.value">
              {{ humanSize(directory.contentLengthSum.value, false, $t('human.size'))  }}
            </span>
            <span class="widget-disk-usage-details__directories__item__bar" :style="{ width: totalPercentage(directory.contentLengthSum.value) }"></span>
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
    await this.loadData()
  },
  watch: {
    path () {
      return this.loadData()
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
        order: { contentLengthSum: 'desc' },
        size: 1000
      }
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
    async sumByDirectory () {
      const index = this.$store.state.insights.index
      // Build the query using Bodynuilder
      const body = bodybuilder()
        // On a specific directory
        .andFilter('term', 'dirname.tree', this.path)
        // Returns no document
        .size(0)
        // Aggregate by dirname entry
        .agg('terms', 'dirname.tree', this.sumOptions, 'byDirname', b => {
          // Create a sub-aggregation to sum the contentLength
          return b.agg('sum', 'contentLength', 'contentLengthSum')
        })
        .build()
      const res = await elasticsearch.search({ index, body, size: 0 })
      const directories = res?.aggregations?.byDirname?.buckets || []
      const hits = res?.hits?.total || 0
      return { directories, hits }
    },
    async sumTotal () {
      const index = this.$store.state.insights.index
      // Build the query using Bodynuilder
      const body = bodybuilder()
        // Only documents...
        .andQuery('match', 'type', 'Document')
        // ...on disk
        .andQuery('match', 'extractionLevel', 0)
        // On a specific directory
        .andFilter('term', 'dirname.tree', this.path)
        // Returns no document
        .size(0)
        // Sum up all sizes
        .aggregation('sum', 'contentLength')
        .build()
      const res = await elasticsearch.search({ index, body, size: 0 })
      // eslint-disable-next-line camelcase
      return res?.aggregations?.agg_sum_contentLength?.value || 0
    },
    loadData: waitFor('disk usage details', async function () {
      const { directories, hits } = await this.sumByDirectory()
      this.directories = directories
      this.hits = hits
      this.total = await this.sumTotal()
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
