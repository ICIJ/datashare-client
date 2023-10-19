<template>
  <div class="widget widget--field-facets">
    <div v-if="widget.title" class="widget__header d-flex align-items-center" :class="{ 'card-body': widget.card }">
      <fa v-if="widget.icon" :icon="widget.icon" fixed-width class="mr-2" />
      <h3 class="m-0 p-0 h5" v-html="title"></h3>
    </div>
    <v-wait :for="loader" transition="fade">
      <div slot="waiting" class="widget__spinner text-center p-4">
        <fa icon="circle-notch" spin size="2x"></fa>
      </div>
      <div class="list-group widget__list" :class="{ 'list-group-flush': widget.card }">
        <component
          :is="item | itemComponent"
          v-for="(item, i) in items"
          :key="i"
          class="list-group-item list-group-item-action widget__list__item"
          :href="item.href"
          :class="{ active: item.active }"
        >
          <div class="d-flex align-items-center">
            <div class="widget__list__item__label">
              {{ item.label }}
            </div>
            <b-badge class="widget__list__item__count ml-auto" pill variant="dark">{{ $n(item.count) }}</b-badge>
          </div>
          <span class="widget__list__item__bar" :style="{ width: totalPercentage(item.count) }"></span>
        </component>
        <infinite-loading v-if="useInfiniteScroll" :identifier="infiniteScrollId" @infinite="loadNextPage">
          <span slot="spinner"></span>
          <span slot="no-results"></span>
        </infinite-loading>
        <div v-if="reachedTheEnd" class="text-muted p-3 text-center">
          <span v-if="items.length">•</span>
          <span v-else>{{ $t('widget.noData') }}</span>
        </div>
      </div>
    </v-wait>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import { get, flatten, camelCase, iteratee, noop, round, uniqueId } from 'lodash'
import { mapState } from 'vuex'
import InfiniteLoading from 'vue-infinite-loading'

/**
 * Widget to display a list of facets on the insights page.
 */
export default {
  name: 'WidgetListGroup',
  components: {
    InfiniteLoading
  },
  filters: {
    itemComponent({ href = null } = {}) {
      return href ? 'a' : 'div'
    }
  },
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
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
    ...mapState('insights', ['project']),
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
  async mounted() {
    await this.loadFirstPage()
  },
  methods: {
    clearPages() {
      this.pages.splice(0, this.pages.length)
    },
    async loadFirstPage() {
      this.clearPages()
      this.loadPageWithLoader()
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
      const { href } = this.$router.resolve({ name: 'search', query })
      return { label, href, count }
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
    },
    totalPercentage(value) {
      if (this.total > 0) {
        return round((value / this.total) * 100, 2) + '%'
      }
      return '0%'
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes slidingBar {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0%);
  }
}

.widget {
  &--field-facets {
    min-height: 100%;
  }

  &__list {
    max-height: 400px;
    overflow: auto;

    &__item {
      color: $body-color;
      min-width: 0;

      &[href] {
        color: $link-color;
      }

      &__label {
        color: inherit;
        word-break: break-all;
      }

      &__bar {
        animation: slidingBar 200ms forwards;
        height: 3px;
        background: currentColor;
        position: absolute;
        left: 0;
        bottom: 0;
        min-width: 1px;
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
