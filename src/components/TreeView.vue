<template>
  <div class="tree-view" :class="{ 'tree-view--compact': compact }">
    <b-collapse :visible="!noHeader">
      <div class="tree-view__header d-flex flex-row text-nowrap">
        <tree-breadcrumb
          :path="path"
          :max-directories="compact ? 2 : 5"
          no-datadir
          datadir-label
          @input="$emit('input', $event)"
        ></tree-breadcrumb>
        <transition name="fade">
          <div v-if="!$wait.waiting('loading tree view data')">
            <span v-if="size" class="tree-view__header__size">
              <fa icon="weight"></fa>
              {{ humanSize(total, false, $t('human.size')) }}
            </span>
            <span
              v-if="count"
              :title="$tc('treeView.hits', hits, { hits })"
              class="tree-view__header__hits ml-2 badge badge-light badge-pill"
            >
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
        <!-- @slot Area to insert content above the tree view -->
        <slot name="above"></slot>
        <b-form-checkbox-group v-model="selected">
          <ul class="list-group list-group-flush tree-view__directories">
            <li
              v-if="hits && selectable"
              class="list-group-item d-flex flex-row align-items-center text-muted tree-view__directories__item"
            >
              <b-form-checkbox
                :id="allDirectoriesInputId"
                :value="path"
                class="tree-view__directories__item__checkbox"
              />
              <label class="flex-grow-1 m-0 text-light" :for="allDirectoriesInputId">
                {{ $t('treeView.all') }} <em class="text-muted">({{ $t('treeView.includingIndividualDocuments') }})</em>
              </label>
              <div class="ml-2 badge badge-light badge-pill" :title="$n(hits)">
                <span v-if="compact">
                  {{ $n(hits) }}
                </span>
                <span v-else> {{ humanNumber(hits) }} {{ $tc('treeView.docs', hits) }} </span>
              </div>
            </li>
            <li
              v-for="directory in directories"
              :key="directory.key"
              class="list-group-item d-flex flex-row align-items-center tree-view__directories__item"
            >
              <b-form-checkbox
                v-if="selectable"
                :value="directory.key"
                class="tree-view__directories__item__checkbox"
              ></b-form-checkbox>
              <a class="flex-grow-1" href @click.prevent="$emit('input', directory.key)">
                {{ directory.key | basename }}
              </a>
              <div
                v-if="size && directory.contentLength"
                class="font-weight-bold ml-2"
                :title="$n(directory.contentLength.value)"
              >
                {{ humanSize(directory.contentLength.value, false, $t('human.size')) }}
              </div>
              <span
                v-if="count"
                :title="$tc('treeView.hits', directory.doc_count, { hits: $n(directory.doc_count) })"
                class="ml-2 badge badge-light badge-pill"
              >
                <span v-if="!directory.doc_count"> - </span>
                <span v-else-if="compact">
                  {{ $n(directory.doc_count) }}
                </span>
                <span v-else>
                  {{ humanNumber(directory.doc_count) }} {{ $tc('treeView.docs', directory.doc_count) }}
                </span>
              </span>
              <span
                v-if="!noBars"
                class="tree-view__directories__item__bar"
                :style="{ width: totalPercentage(directory.contentLength.value) }"
              ></span>
            </li>
            <li
              v-if="!selectable && !directories.length"
              class="list-group-item tree-view__directories__item tree-view__directories__item--no-folders text-muted text-center"
            >
              {{ $t('widget.noFolders') }}
            </li>
          </ul>
          <infinite-loading v-if="useInfiniteScroll" :identifier="infiniteScrollId" @infinite="nextLoadData">
            <span slot="spinner"></span>
            <span slot="no-more"></span>
            <span slot="no-results"></span>
          </infinite-loading>
        </b-form-checkbox-group>
        <!-- @slot Area to insert content bellow the tree view -->
        <slot name="bellow"></slot>
      </div>
    </v-wait>
  </div>
</template>

<script>
import { difference, flatten, filter, get, identity, includes, noop, round, uniq, uniqBy, uniqueId } from 'lodash'
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
  components: {
    InfiniteLoading,
    TreeBreadcrumb
  },
  filters: {
    basename
  },
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
     * The ES indices
     */
    projects: {
      type: Array,
      default: () => ['local-datashare']
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
      validator: (order) => includes(['_count', '_key', 'contentLength'], order)
    },
    /**
     * Order to sort by (asc or desc)
     */
    sortByOrder: {
      type: String,
      default: 'desc',
      validator: (order) => includes(['asc', 'desc'], order)
    },
    /**
     * If the true, the document count and size of each directory will include
     * child documents.
     */
    includeChildrenDocuments: {
      type: Boolean
    }
  },
  data() {
    return {
      pages: [],
      tree: [],
      infiniteScrollId: uniqueId('infinite-scroll-'),
      allDirectoriesInputId: uniqueId('all-directories-input-'),
      pathSeparator: this.$core.config.get('pathSeparator', '/')
    }
  },
  computed: {
    lastPage() {
      return this.pages[this.pages.length - 1]
    },
    lastPageDirectories() {
      return get(this.lastPage, 'aggregations.byDirname.buckets', [])
    },
    offset() {
      return get(this, 'directories.length', 0)
    },
    nextOffset() {
      return this.offset + this.bucketsSize
    },
    bucketsSize() {
      return 50
    },
    order() {
      return { [this.sortBy]: this.sortByOrder }
    },
    treeChildren() {
      return filter(get(this.tree, 'contents', []), { type: 'directory' })
    },
    treeAsPagesBuckets() {
      return this.treeChildren
        .filter((dir) => dir.type === 'directory')
        .map((dir) => ({ key: dir.name, contentLength: 0, doc_count: 0 }))
    },
    pagesBuckets() {
      return this.pages.map((p) => get(p, 'aggregations.byDirname.buckets', []))
    },
    flattenPagesBuckets() {
      return flatten(this.pagesBuckets)
    },
    directories() {
      return uniqBy([...this.flattenPagesBuckets, ...this.treeAsPagesBuckets], (dir) => dir.key)
    },
    hits() {
      return get(this, 'lastPage.hits.total.value', 0)
    },
    total() {
      return get(this, 'lastPage.aggregations.totalContentLength.value', -1)
    },
    aggregationOptions() {
      const include = this.suffixPathTokens(this.pathSeparator.concat('.*')).join('|')
      const exclude = this.suffixPathTokens(this.pathSeparator.concat('.*', this.pathSeparator, '.*')).join('|')
      return {
        include: this.usesWindowsSepator ? this.doubleWindowsSeparator(include) : include,
        exclude: this.usesWindowsSepator ? this.doubleWindowsSeparator(exclude) : exclude,
        size: this.nextOffset,
        order: this.order
      }
    },
    reachedTheEnd() {
      return this.lastPageDirectories.length < this.bucketsSize
    },
    useInfiniteScroll() {
      return this.infiniteScroll && this.offset > 0 && !this.reachedTheEnd
    },
    pathTokens() {
      /**
       * @deprecated Since 9.4.2, the dirname field is tokenized using the
       * "lowercase" filter. To ensure retro-compatibility, we apply lookup for
       * the path in both lowercase and orignal value for this field (if they
       * are different).
       */
      return uniq([this.path, this.path.toLowerCase()])
    },
    usesWindowsSepator() {
      return this.pathSeparator === '\\'
    },
    selected: {
      get() {
        return this.selectedPaths
      },
      set(paths) {
        const diff = difference(paths, this.selectedPaths)
        // True if the current path just has been selected.
        // This is equivalent to select "all.
        if (diff.includes(this.path)) {
          paths = this.pathsWihtoutSiblings(paths)
          // True if a sibling directory is selected, not the current path
        } else if (diff.length && paths.includes(this.path)) {
          paths = this.pathsWithoutCurrent(paths)
        }
        return this.selectPaths(paths)
      }
    }
  },
  watch: {
    path() {
      return this.reloadDataWithSpinner()
    },
    sortBy() {
      return this.reloadDataWithSpinner()
    },
    sortByOrder() {
      return this.reloadDataWithSpinner()
    },
    directories() {
      /**
       * Called when more directories are loaded
       */
      this.$emit('update:directories', this.directories)
    }
  },
  async created() {
    await this.loadDataWithSpinner({ clearPages: true })
  },
  methods: {
    humanSize,
    humanNumber,
    suffixPathTokens(suffix = '') {
      return this.pathTokens.map((token) => `${token}${suffix}`)
    },
    doubleWindowsSeparator(paths) {
      return paths.split('\\').join('\\\\')
    },
    selectPaths(paths) {
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
    pathsWihtoutSiblings(paths) {
      return filter(paths, (path) => {
        return path === this.path || !path.startsWith(this.path)
      })
    },
    pathsWithoutCurrent(paths) {
      return filter(paths, (path) => {
        return path && path !== this.path
      })
    },
    totalPercentage(value) {
      if (this.total > 0) {
        return round((value / this.total) * 100, 2) + '%'
      } else {
        return '0%'
      }
    },
    bodybuilderBase({ from = 0, size = 100 } = {}) {
      const body = bodybuilder().size(0).rawOption('track_total_hits', true)
      // Only the extraction level is an optional query
      if (!this.includeChildrenDocuments) {
        body.andQuery('match', 'extractionLevel', 0)
      }
      return body
        .andQuery('bool', (bool) => {
          // Add all path tokens in a "should" statement
          this.pathTokens.forEach((t) => bool.orQuery('term', 'dirname.tree', t))
          return bool
        })
        .andQuery('match', 'type', 'Document')
        .agg('terms', 'dirname.tree', this.aggregationOptions, 'byDirname', (b) => {
          return b.agg('sum', 'contentLength', 'contentLength').agg(
            'bucket_sort',
            {
              size,
              from
            },
            'bucket_truncate'
          )
        })
        .agg('sum', 'contentLength', 'totalContentLength')
    },
    async nextLoadData($infiniteLoadingState) {
      await this.loadData()
      // Did we reach the end?
      const method = this.reachedTheEnd ? 'complete' : 'loaded'
      // Call the right method (with "noop" as safety net in case the method can't be found)
      return get($infiniteLoadingState, method, noop)()
    },
    async reloadDataWithSpinner() {
      await this.loadDataWithSpinner({ clearPages: true })
      this.$set(this, 'infiniteScrollId', uniqueId())
    },
    loadDataWithSpinner: waitFor('loading tree view data', function (...args) {
      return this.loadData(...args)
    }),
    async loadData({ clearPages = false } = {}) {
      const index = this.projects.join(',')
      const from = clearPages ? 0 : this.offset
      const size = this.bucketsSize
      const body = this.preBodyBuild(this.bodybuilderBase({ from, size })).build()
      const preference = 'tree-view-paths'
      const res = await elasticsearch.search({ index, body, preference, size: 0 })
      // Clear the list of pages (to start over!)
      if (clearPages) await this.clearPagesAndLoadTree()
      // Add the result as a page
      this.pages.push(res)
    },
    clearPages() {
      return this.pages.splice(0, this.pages.length)
    },
    async clearPagesAndLoadTree() {
      this.clearPages()
      // Only load the tree if we clear out the pages
      // and entirely load the folder. This way we avoid
      // load directories from the /tree API when they are
      // already present in next result page of the
      // ElasticSearch aggregation.
      //
      // The /tree API is disabled in server so we ensure
      // the mode is correct before running it.
      if (this.reachedTheEnd && this.$config.get('mode') !== 'SERVER') {
        await this.loadTree()
      }
    },
    async loadTree() {
      this.tree = await this.$core.api.tree(this.path)
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
    transition: opacity 0.5s;
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
