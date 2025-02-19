<template>
  <div class="widget widget--field-facets">
    <div v-if="widget.title" class="widget__header d-flex align-items-center">
      <phosphor-icon v-if="widget.icon" :name="widget.icon" class="me-2" size="2em" />
      <h3 class="m-0 p-0 h5" v-html="title"></h3>
    </div>
    <v-wait :for="loader" transition="fade">
      <template #waiting>
        <div class="widget__spinner text-center p-4">
          <phosphor-icon name="circle-notch" spin size="2em" />
        </div>
      </template>
      <div class="widget__list">
        <widget-field-facets-entry
          v-for="({ label, count, to }, i) in items"
          :key="i"
          class="widget__list__item mb-2"
          :label="label"
          :count="count"
          :total="total"
          :to="to"
        />
        <infinite-loading v-if="useInfiniteScroll" :identifier="infiniteScrollId" @infinite="loadNextPage">
          <template #spinner><span></span></template>
          <template #complete><span></span></template>
        </infinite-loading>
        <div v-if="reachedTheEnd" class="text-tertiary p-3 text-center">
          <span v-if="items.length">•</span>
          <span v-else>{{ $t('widget.noData') }}</span>
        </div>
      </div>
    </v-wait>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import { get, flatten, camelCase, iteratee, noop, uniqueId } from 'lodash'
import InfiniteLoading from 'v3-infinite-loading'
import { PhosphorIcon } from '@icij/murmur-next'

import WidgetFieldFacetsEntry from './WidgetFieldFacetsEntry'

import { useInsightsStore } from '@/store/modules/insights'

/**
 * Widget to display a list of facets on the insights page.
 */
export default {
  name: 'WidgetListGroup',
  components: {
    InfiniteLoading,
    PhosphorIcon,
    WidgetFieldFacetsEntry
  },
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object,
      default: () => {}
    },
    bucketsSize: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {
      pages: [],
      infiniteScrollId: uniqueId('infinite-scroll-')
    }
  },
  computed: {
    project() {
      return useInsightsStore().project
    },
    // The items list is just a concatenation of all pages
    buckets() {
      return flatten(this.pages.map(iteratee('aggregations.facets.buckets')))
    },
    items() {
      return this.buckets.map(this.bucketToItem)
    },
    field() {
      return this.widget.field
    },
    routeQueryField() {
      return this.widget.routeQueryField ?? 'q'
    },
    total() {
      return get(this.pages, '0.hits.total.value', 0)
    },
    title() {
      if (this.$te(this.titleTranslationKey)) {
        return this.$t(this.titleTranslationKey)
      }

      return this.widget.title
    },
    titleTranslationKey() {
      return `widget.${camelCase(this.widget.title)}.title`
    },
    loader() {
      return uniqueId('loading-field-facets-')
    },
    offset() {
      return this.pages.length * this.bucketsSize
    },
    nextOffset() {
      return this.offset + this.bucketsSize
    },
    lastPage() {
      return this.pages[this.pages.length - 1]
    },
    reachedTheEnd() {
      return get(this, 'lastPage.length', 0) < this.bucketsSize
    },
    useInfiniteScroll() {
      return this.offset > 0 && !this.reachedTheEnd
    }
  },
  mounted() {
    return this.loadFirstPage()
  },
  methods: {
    clearPages() {
      this.pages.splice(0, this.pages.length)
    },
    async loadFirstPage() {
      this.clearPages()
      await this.loadPageWithLoader()
    },
    async loadPageWithLoader() {
      this.$wait.start(this.loader)
      await this.loadPage()
      this.$wait.end(this.loader)
    },
    async loadPage() {
      const body = this.bodybuilderBase().build()
      const preference = 'widget-field-facets-' + this.widget.name
      const page = await this.$core.api.elasticsearch.search({ index: this.project, size: 0, body, preference })
      this.pages.push(page)
    },
    async loadNextPage($infiniteLoadingState) {
      await this.loadPage()
      // Did we reach the end?
      const method = this.reachedTheEnd ? 'complete' : 'loaded'
      // Call the right method (with "noop" as safety net in case the method can't be found)
      return get($infiniteLoadingState, method, noop)()
    },
    bodybuilderBase() {
      const size = this.nextOffset
      return bodybuilder()
        .size(0)
        .rawOption('track_total_hits', this.pages.length === 0)
        .query('match', 'type', 'Document')
        .agg('terms', this.field, { size }, 'facets', (sub) => {
          const from = this.offset
          const size = this.bucketsSize
          return sub.agg('bucket_sort', { size, from }, 'bucket_sort_truncate')
        })
    },
    bucketToItem(bucket) {
      const label = this.bucketToTranslation(bucket)
      const query = this.bucketToQuery(bucket)
      const count = get(bucket, 'doc_count', 0)
      const to = { name: 'search', query }
      return { label, to, count }
    },
    bucketToQueryValue({ key }) {
      if (this.routeQueryField === 'q') {
        return `${this.field}:"${key}"`
      }
      return key
    },
    bucketToQuery(bucket) {
      const value = this.bucketToQueryValue(bucket)
      const indices = [this.project]
      return { [this.routeQueryField]: value, indices }
    },
    bucketToTranslation(bucket) {
      const translationKey = this.widget.bucketTranslation(bucket)
      return this.$te(translationKey) ? this.$t(translationKey) : translationKey
    }
  }
}
</script>

<style lang="scss" scoped>
.widget {
  &--field-facets {
    min-height: 100%;
  }

  .card &__header {
    padding: $spacer-lg;
  }

  &__list {
    max-height: 400px;
    overflow: auto;

    .card & {
      padding: 0 $spacer-lg;
    }
  }
}
</style>
