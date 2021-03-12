<template>
  <div class="tree-view" :class="{ 'tree-view--compact': compact }">
    <b-collapse :visible="!noHeader">
      <div class="tree-view__header d-flex flex-row text-nowrap">
        <tree-breadcrumb :path="path" @input="$emit('input', $event)" :max-directories="compact ? 2 : 5" no-datadir datadir-label />
        <transition name="fade">
          <div v-if="!$wait.waiting('loading tree view data')">
            <span v-if="size" class="tree-view__header__size">
              <fa icon="weight"></fa>
              {{ humanSize(total, false, $t('human.size')) }}
            </span>
            <span :title="$tc('treeView.hits', hits, { hits })" class="tree-view__header__hits ml-2 badge badge-light badge-pill" v-if="count">
              {{ humanNumber(hits, $t('human.number')) }} {{ $tc('treeView.docs', hits) }}
            </span>
          </div>
        </transition>
      </div>
    </b-collapse>
    <v-wait for="loading tree view data" transition="fade">
      <div slot="waiting" class="tree-view__spinner text-center">
        <fa icon="circle-notch" spin size="2x"></fa>
      </div>
      <div>
        <b-form-checkbox-group v-model="selected" @input="selectPaths">
          <ul class="list-group list-group-flush tree-view__directories">
            <li v-for="directory in directories" :key="directory.key" class="list-group-item d-flex flex-row align-items-center tree-view__directories__item">
              <b-form-checkbox :value="directory.key" v-if="selectable" class="tree-view__directories__item__checkbox" />
              <a class="flex-grow-1" href @click.prevent="$emit('input', directory.key)">
                {{ directory.key | basename }}
              </a>
              <div class="font-weight-bold ml-2" :title="$n(directory.contentLength.value)" v-if="size">
                {{ humanSize(directory.contentLength.value, false, $t('human.size'))  }}
              </div>
              <span :title="$tc('treeView.hits', directory.doc_count, { hits: $n(directory.doc_count) })" class="ml-2 badge badge-light badge-pill" v-if="count">
                <span v-if="compact">
                  {{ $n(directory.doc_count) }}
                </span>
                <span v-else>
                  {{ humanNumber(directory.doc_count) }} {{ $tc('treeView.docs', directory.doc_count) }}
                </span>
              </span>
              <span class="tree-view__directories__item__bar" v-if="!noBars" :style="{ width: totalPercentage(directory.contentLength.value) }"></span>
            </li>
            <li v-if="!directories.length" class="list-group-item tree-view__directories__item tree-view__directories__item--no-folders text-muted text-center">
              {{ $t('widget.noFolders') }}
            </li>
          </ul>
          <infinite-loading @infinite="nextLoadData" v-if="useInfiniteScroll" :identifier="infiniteScrollId">
            <span slot="spinner" />
            <span slot="no-more" />
            <span slot="no-results" />
          </infinite-loading>
        </b-form-checkbox-group>
      </div>
    </v-wait>
  </div>
</template>

<script>
import { flatten, get, identity, includes, noop, round, uniq, uniqueId } from 'lodash'
import bodybuilder from 'bodybuilder'
import { basename } from 'path'
import { waitFor } from 'vue-wait'
import InfiniteLoading from 'vue-infinite-loading'

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
      default: 'local-datashare'
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
    },
    /**
     * Deactivate the header (including breadcrumb and total)
     */
    noHeader: {
      type: Boolean,
      default: false
    },
    /**
     * Deactivate the bar chart bellow each folder
     */
    noBars: {
      type: Boolean,
      default: false
    },
    /**
     * Display the tree view in compact mode
     */
    compact: {
      type: Boolean,
      default: false
    },
    /**
     * Function to apply to the elasticsearch body before it's build
     */
    preBodyBuild: {
      type: Function,
      default: identity
    },
    /**
     * Either or not results should be loaded on scroll
     */
    infiniteScroll: {
      type: Boolean,
      default: true
    },
    /**
     * Key to sort the directories
     */
    sortBy: {
      type: String,
      default: 'contentLength',
      validate: order => includes(['_count', '_key', 'contentLength'], order)
    },
    /**
     * Order to sort by (asc or desc)
     */
    sortByOrder: {
      type: String,
      default: 'desc',
      validate: order => includes(['asc', 'desc'], order)
    },
    /**
     * If the true, the document count and size of each directory will include
     * child documents.
     */
    includeChildrenDocuments: {
      type: Boolean
    }
  },
  components: {
    InfiniteLoading,
    TreeBreadcrumb
  },
  data () {
    return {
      pages: [],
      selected: [],
      infiniteScrollId: uniqueId()
    }
  },
  async created () {
    this.$set(this, 'selected', this.selectedPaths)
    await this.loadDataWithSpinner({ clearPages: true })
  },
  watch: {
    path () {
      return this.reloadDataWithSpinner()
    },
    sortBy () {
      return this.reloadDataWithSpinner()
    },
    sortByOrder () {
      return this.reloadDataWithSpinner()
    },
    selectedPaths () {
      this.$set(this, 'selected', this.selectedPaths)
    },
    directories () {
      /**
       * Called when more directories are loaded
       */
      this.$emit('update:directories', this.directories)
    }
  },
  filters: {
    basename
  },
  computed: {
    lastPage () {
      return this.pages[this.pages.length - 1]
    },
    lastPageDirectories () {
      return get(this.lastPage, 'aggregations.byDirname.buckets', [])
    },
    offset () {
      return get(this, 'directories.length', 0)
    },
    nextOffset () {
      return this.offset + this.bucketsSize
    },
    bucketsSize () {
      return 50
    },
    order () {
      return { [this.sortBy]: this.sortByOrder }
    },
    pagesBuckets () {
      return this.pages.map(p => get(p, 'aggregations.byDirname.buckets', []))
    },
    directories () {
      return flatten(this.pagesBuckets)
    },
    hits () {
      return get(this, 'lastPage.hits.total.value', 0)
    },
    total () {
      return get(this, 'lastPage.aggregations.totalContentLength.value', -1)
    },
    aggregationOptions () {
      return {
        include: this.suffixPathTokens('/.*').join('|'),
        exclude: this.suffixPathTokens('/.*/.*').join('|'),
        size: this.nextOffset,
        order: this.order
      }
    },
    reachedTheEnd () {
      return this.lastPageDirectories.length < this.bucketsSize
    },
    useInfiniteScroll () {
      return this.infiniteScroll && this.offset > 0 && !this.reachedTheEnd
    },
    pathTokens () {
      /**
       * @deprecated Since 9.4.2, the dirname field is tokenized using the
       * "lowercase" filter. To ensure retro-compatibility, we apply lookup for
       * the path in both lowercase and orignal value for this field (if they
       * are different).
       */
      return uniq([this.path, this.path.toLowerCase()])
    }
  },
  methods: {
    humanSize,
    humanNumber,
    suffixPathTokens (suffix = '') {
      return this.pathTokens.map(token => `${token}${suffix}`)
    },
    selectPaths (paths) {
      /**
       * The selectedPaths are updated (deprecated event).
       *
       * @event checked
       */
      this.$emit('checked', paths)
      /**
       * The selectedPaths are updated. New way to propagate change compatible with the .sync modifier.
       *
       * @see https://vuejs.org/v2/guide/components-custom-events.html#sync-Modifier
       * @event update:selectedPaths
       */
      this.$emit('update:selectedPaths', paths)
    },
    totalPercentage (value) {
      if (this.total > 0) {
        return round(value / this.total * 100, 2) + '%'
      } else {
        return '0%'
      }
    },
    bodybuilderBase ({ from = 0, size = 100 } = {}) {
      const body = bodybuilder().size(0)
      // Only the extraction level is an optional query
      if (!this.includeChildrenDocuments) {
        body.andQuery('match', 'extractionLevel', 0)
      }
      // Add all path tokens in a "should" statement
      this.pathTokens.forEach(t => body.orQuery('term', 'dirname.tree', t))
      return body
        .andQuery('match', 'type', 'Document')
        .agg('terms', 'dirname.tree', this.aggregationOptions, 'byDirname', b => {
          return b
            .agg('sum', 'contentLength', 'contentLength')
            .agg('bucket_sort', {
              size,
              from
            }, 'bucket_truncate')
        })
        .agg('sum', 'contentLength', 'totalContentLength')
    },
    async nextLoadData ($infiniteLoadingState) {
      await this.loadData()
      // Did we reach the end?
      const method = this.reachedTheEnd ? 'complete' : 'loaded'
      // Call the right method (with "noop" as safety net in case the method can't be found)
      return get($infiniteLoadingState, method, noop)()
    },
    async reloadDataWithSpinner () {
      await this.loadDataWithSpinner({ clearPages: true })
      this.$set(this, 'infiniteScrollId', uniqueId())
    },
    loadDataWithSpinner: waitFor('loading tree view data', function (...args) {
      return this.loadData(...args)
    }),
    async loadData ({ clearPages = false } = {}) {
      const index = this.project
      const from = clearPages ? 0 : this.offset
      const size = this.bucketsSize
      const body = this.preBodyBuild(this.bodybuilderBase({ from, size })).build()
      const res = await elasticsearch.search({ index, body, size: 0 })
      // Clear the list of pages (to start over!)
      if (clearPages) this.clearPages()
      // Add the result as a page
      this.pages.push(res)
    },
    clearPages () {
      return this.pages.splice(0, this.pages.length)
    }
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

      &__spinner {
        padding: $spacer * 3;

        .tree-view--compact & {
          padding: $spacer;
        }
      }

      &__header {
        padding: $list-group-item-padding-y $list-group-item-padding-x;
        color: inherit;

        .tree-view--compact & {
          padding: $spacer * 0.5;
        }
      }

      &__directories {

        &__item {
          position: relative;

          .tree-view & &__checkbox {
            margin: 0;
            margin-right: $spacer * 0.5;
          }

          .tree-view--compact & &__checkbox {
            margin: 0;
            margin-right: $spacer * 0.25;
          }

          .tree-view--compact & {
            padding: $spacer * 0.25 $spacer * 0.5;

            &--no-folders {
              padding: 0.5rem;
            }
          }

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
