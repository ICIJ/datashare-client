<template>
  <div class="tree-view">
    <div class="bg-light py-3 px-4 d-flex flex-row text-nowrap">
      <tree-breadcrumb :path="path" @input="$emit('input', $event)" no-datadir></tree-breadcrumb>
      <transition name="fade">
        <div v-if="!$wait.waiting('loading tree view data')">
          <span v-if="size">
            <fa icon="weight"></fa>
            {{ humanSize(total, false, $t('human.size')) }}
          </span>
        </div>
      </transition>
    </div>
    <v-wait for="loading tree view data" transition="fade">
      <div slot="waiting" class="p-4 text-center">
        <fa icon="circle-notch" spin size="2x"></fa>
      </div>
      <div>
        <b-form-checkbox-group v-model="selected" @input="$emit('checked', $event)">
          <ul class="list-group list-group-flush tree-view__directories">
            <li v-for="directory in directories" :key="directory.key" class="list-group-item d-flex flex-row align-items-center tree-view__directories__item">
              <b-form-checkbox :value="directory.key" v-if="selectable"></b-form-checkbox>
              <a class="flex-grow-1" href @click.prevent="$emit('input', directory.key)">
                {{ directory.key | basename }}
              </a>
              <div class="font-weight-bold ml-2" :title="$n(directory.contentLength.value)" v-if="size">
                {{ humanSize(directory.contentLength.value, false, $t('human.size'))  }}
              </div>
              <span :title="$tc('widget.diskUsage.hits', hits, { hits: $n(directory.doc_count) })" class="ml-2 badge badge-light border text-muted" v-if="count">
                {{ humanNumber(directory.doc_count) }}
              </span>
              <span class="tree-view__directories__item__bar" :style="{ width: totalPercentage(directory.contentLength.value) }"></span>
            </li>
            <li v-if="!directories.length" class="list-group-item d-flex flex-row tree-view__directories__item font-italic">
              {{ $t('widget.noFolders') }}
            </li>
            <li class="list-group-item tree-view__directories__item tree-view__directories__item--hits" :title="$tc('widget.diskUsage.hits', hits, { hits })" v-if="count">
              {{ $tc('widget.diskUsage.hits', hits, { hits: humanNumber(hits, $t('human.number')) }) }}
            </li>
          </ul>
        </b-form-checkbox-group>
      </div>
    </v-wait>
  </div>
</template>

<script>
import round from 'lodash/round'
import bodybuilder from 'bodybuilder'
import { basename } from 'path'
import { waitFor } from 'vue-wait'

import elasticsearch from '@/api/elasticsearch'
import TreeBreadcrumb from '@/components/TreeBreadcrumb'
import humanNumber from '@/filters/humanNumber'
import humanSize from '@/filters/humanSize'

/**
 * A view listing directories from a specific path.
 */
export default {
  name: 'TreeView',
  model: {
    prop: 'path',
    event: 'input'
  },
  props: {
    /**
     * List directories from this path.
     * @model
     */
    path: {
      type: String
    },
    /**
     * The ES index
     */
    project: {
      type: String,
      default: undefined
    },
    /**
     * A list of selected paths
     */
    selectedPaths: {
      type: Array,
      default: () => []
    },
    /**
     * Either or not paths can be selected
     */
    selectable: {
      type: Boolean,
      default: false
    },
    /**
     * Show the number of documents by directory.
     */
    count: {
      type: Boolean,
      default: false
    },
    /**
     * Show the size of documents by directory.
     */
    size: {
      type: Boolean,
      default: false
    }
  },
  components: {
    TreeBreadcrumb
  },
  data () {
    return {
      directories: [],
      hits: 0,
      selected: [],
      total: -1
    }
  },
  async created () {
    this.$set(this, 'selected', this.selectedPaths)
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
        include: this.path + '/.*',
        exclude: this.path + '/.*/.*',
        order: { contentLength: 'desc' },
        size: 1000
      }
    },
    bodybuilderBase () {
      return bodybuilder()
        .size(0)
        .andQuery('match', 'type', 'Document')
        .andQuery('match', 'extractionLevel', 0)
        .andFilter('term', 'dirname.tree', this.path)
        .agg('terms', 'dirname.tree', this.sumOptions, 'byDirname', b => b.agg('sum', 'contentLength', 'contentLength'))
        .aggregation('sum', 'contentLength', 'totalContentLength')
    }
  },
  methods: {
    humanSize,
    humanNumber,
    totalPercentage (value) {
      if (this.total > 0) {
        return round(value / this.total * 100, 2) + '%'
      } else {
        return '0%'
      }
    },
    loadData: waitFor('loading tree view data', async function () {
      const body = this.bodybuilderBase.build()
      const res = await elasticsearch.search({ index: this.project, body, size: 0 })
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

  .tree-view {
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
            animation: slidingBar 200ms forwards;
            background: $primary;
            bottom: 0;
            height: 3px;
            left: 0;
            position: absolute;
            transform: translateX(-100%);
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
