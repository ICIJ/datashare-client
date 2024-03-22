<template>
  <div class="widget widget--recommended-by">
    <div class="widget__header d-flex align-items-center" :class="{ 'card-body': widget.card }">
      <fa icon="users" fixed-width class="me-2" />
      <h3 class="m-0 p-0 h5">{{ $t('widget.recommendedBy.title') }}</h3>
    </div>
    <v-wait :for="loader" transition="fade">
      <template #waiting>
        <div class="widget__spinner text-center p-4">
          <fa icon="circle-notch" spin size="2x"></fa>
        </div>
      </template>
      <div class="list-group widget__list" :class="{ 'list-group-flush': widget.card }">
        <a
          v-for="({ document, href, user, creationDate }, i) in items"
          :key="i"
          class="list-group-item list-group-item-action widget__list__item d-flex align-items-start flex-truncate"
          :href="href"
        >
          <div v-if="!widget.hideThumbnails && widget.cols >= 6" class="d-none d-md-block flex-shrink-0">
            <document-thumbnail :document="document" crop lazy class="mt-1 me-3" />
          </div>
          <div class="flex-grow-1">
            <div class="widget__list__item__heading d-flex align-items-start">
              <document-sliced-name
                wrap
                :document="document"
                class="widget__list__item__heading__name text-primary py-1"
              />
              <div
                class="widget__list__item__heading__meta ms-auto py-1 ps-3 d-flex align-items-center text-muted flex-shrink-0"
              >
                <span
                  v-if="creationDate"
                  v-b-tooltip
                  class="widget__list__item__heading__meta__creation-date text-nowrap d-flex"
                  :title="humanLongDate(creationDate, $i18n.locale)"
                >
                  {{ fromNow(creationDate, $i18n.locale, true) }}
                </span>
                <user-display
                  :username="user.id"
                  avatar-height="1em"
                  flip
                  hide-link
                  class="widget__list__item__heading__meta__user text-nowrap"
                />
              </div>
            </div>
            <div class="widget__list__item__path text-muted text-truncate">
              <fa icon="folder" class="me-1" />
              {{ shortenPath(document.path) }}
            </div>
          </div>
        </a>
        <infinite-loading v-if="useInfiniteScroll" :identifier="infiniteScrollId" @infinite="loadNextPage">
          <span slot="spinner"></span>
          <span slot="no-results"></span>
        </infinite-loading>
        <div v-if="reachedTheEnd" class="text-muted p-3 text-center">
          <span v-if="items.length">•</span>
          <span v-else>{{ $t('widget.noRecommendations') }}</span>
        </div>
      </div>
    </v-wait>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import { get, property, find, flatten, noop, uniqueId } from 'lodash'
import InfiniteLoading from 'vue-infinite-loading'

import { fromNow, humanLongDate } from '@/filters/humanDate'
import EsDocList from '@/api/resources/EsDocList'
import DocumentThumbnail from '@/components/DocumentThumbnail'
import DocumentSlicedName from '@/components/DocumentSlicedName'
import UserDisplay from '@/components/UserDisplay'

/**
 * Widget to display a list of facets on the insights page.
 */
export default {
  name: 'WidgetRecommendedBy',
  components: {
    DocumentThumbnail,
    DocumentSlicedName,
    InfiniteLoading,
    UserDisplay
  },
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object,
      default: () => {}
    },
    pageSize: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {
      pages: [],
      hits: [],
      infiniteScrollId: uniqueId('infinite-scroll-')
    }
  },
  computed: {
    project() {
      return this.$store.state.insights.project
    },
    items() {
      return flatten(this.pages).map(this.recordToItem)
    },
    documents() {
      return flatten(this.hits.map(property('hits')))
    },
    loader() {
      return uniqueId('loading-recommended-by-')
    },
    offset() {
      return this.pages.length * this.pageSize
    },
    nextOffset() {
      return this.offset + this.pageSize
    },
    lastPage() {
      return this.pages[this.pages.length - 1]
    },
    reachedTheEnd() {
      return get(this, 'lastPage.length', 0) < this.pageSize
    },
    useInfiniteScroll() {
      return this.offset > 0 && !this.reachedTheEnd
    }
  },
  mounted() {
    return this.loadFirstPage()
  },
  methods: {
    fromNow,
    humanLongDate,
    clearPages() {
      this.pages.splice(0, this.pages.length)
      this.documents.splice(0, this.documents.length)
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
      const page = await this.$core.api.getDocumentUserRecommendations(this.offset, this.pageSize, this.project)
      const hits = await this.getPageHits(page)
      this.pages.push(page)
      this.hits.push(hits)
    },
    async loadNextPage($infiniteLoadingState) {
      await this.loadPage()
      // Did we reach the end?
      const method = this.reachedTheEnd ? 'complete' : 'loaded'
      // Call the right method (with "noop" as safety net in case the method can't be found)
      return get($infiniteLoadingState, method, noop)()
    },
    recordToItem({ user, document: { id }, creationDate }) {
      const document = this.findDocument(id)
      const { href } = this.$router.resolve({ name: 'document-standalone', params: document.routerParams })
      return { document, href, user, creationDate }
    },
    async getPageHits(page) {
      const preference = 'widget-recommended-by'
      const body = this.getPageHitsBody(page)
      const index = this.project
      const response = await this.$core.api.elasticsearch.search({ index, body, preference })
      return new EsDocList(response)
    },
    getPageHitsBody(page) {
      const values = page.map((recommendation) => recommendation.document.id)
      const excludes = ['content', 'content_translated']
      return bodybuilder().size(values.length).rawOption('_source', { excludes }).query('ids', { values }).build()
    },
    findDocument(id) {
      return find(this.documents, { id })
    },
    shortenPath(path) {
      return '.' + path.split(this.$config.get('dataDir', import.meta.env.VITE_DATA_PREFIX)).pop()
    }
  }
}
</script>

<style lang="scss" scoped>
.widget--recommended-by {
  min-height: 100%;

  .widget__list {
    max-height: 400px;
    overflow: auto;

    &__item {
      &__heading {
        &__meta {
          &__creation-date {
            &:after {
              content: '·';
              margin: 0 $spacer-xxs;
            }
          }
        }
      }
    }
  }
}
</style>
