<template>
  <div class="widget widget--recommended-by">
    <div class="widget__header d-flex align-items-center">
      <fa icon="users" fixed-width class="me-2" />
      <h3 class="m-0 p-0 widget__header__title">{{ $t('widget.recommendedBy.title') }}</h3>
    </div>
    <v-wait :for="loader" transition="fade">
      <template #waiting>
        <div class="widget__spinner text-center p-4">
          <fa icon="circle-notch" spin size="2x"></fa>
        </div>
      </template>
      <div class="list-group widget__list" :class="{ 'list-group-flush': widget.card }">
        <document-card
          v-for="({ document, to, user, creationDate }, i) in items"
          :key="i"
          :to="to"
          class="list-group-item list-group-item-action widget__list__item py-3"
          :document="document"
          :properties="['title', 'thumbnail', 'path', 'creationDate']"
        >
          <template #actions>
            <div class="d-flex flew-nowrap gap-3">
              <display-user v-if="showUser" :value="user.id" />
              <display-datetime :value="creationDate" format="fromNow" class="text-secondary-emphasis" />
            </div>
          </template>
        </document-card>
        <infinite-loading v-if="useInfiniteScroll" :identifier="infiniteScrollId" @infinite="loadNextPage">
          <template #spinner><span></span></template>
          <template #complete><span></span></template>
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
import InfiniteLoading from 'v3-infinite-loading'

import { MODE_NAME } from '@/mode'
import EsDocList from '@/api/resources/EsDocList'
import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'
import DisplayUser from '@/components/Display/DisplayUser'
import DisplayDatetime from '@/components/Display/DisplayDatetime'

/**
 * Widget to display a list of facets on the insights page.
 */
export default {
  name: 'WidgetRecommendedBy',
  components: {
    DocumentCard,
    InfiniteLoading,
    DisplayDatetime,
    DisplayUser
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
    },
    showUser() {
      return this.$config?.get('mode') === MODE_NAME.SERVER
    }
  },
  mounted() {
    return this.loadFirstPage()
  },
  methods: {
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
      const params = document.routerParams
      const to = { name: 'document-standalone', params }
      return { document, to, user, creationDate }
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
    }
  }
}
</script>

<style lang="scss" scoped>
.widget--recommended-by {
  min-height: 100%;

  .widget__header {
    .card & {
      padding: $spacer-lg;
    }

    &__title {
      font-size: 1.25rem;
      font-weight: 700;
    }
  }

  .widget__list {
    max-height: 400px;
    overflow: auto;

    .card & {
      padding: 0 $spacer-lg;
    }

    &__item {
      background: transparent;
      padding: $spacer-sm 0;
      border: 0;

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
