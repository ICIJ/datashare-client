<template>
  <div class="widget widget--recommended-by">
    <div class="widget__header d-flex align-items-center">
      <phosphor-icon
        :name="PhUsersThree"
        class="me-2"
        size="2em"
      />
      <h3 class="m-0 p-0 widget__header__title">
        {{ t('widget.recommendedBy.title') }}
      </h3>
    </div>
    <app-wait
      :for="loaderId"
      transition="fade"
    >
      <template #waiting>
        <div class="widget__spinner text-center p-4">
          <phosphor-icon
            :name="PhCircleNotch"
            spin
            size="2em"
          />
        </div>
      </template>
      <div
        class="list-group widget__list"
        :class="{ 'list-group-flush': widget.card }"
      >
        <document-card
          v-for="({ document, user, creationDate }, i) in items"
          :key="i"
          class="list-group-item list-group-item-action widget__list__item py-3"
          :document="document"
          :properties="['title', 'thumbnail', 'path', 'creationDate']"
          modal
          route-name="document-standalone"
        >
          <template #actions>
            <div class="d-flex flew-nowrap gap-3">
              <display-user :value="user.id" />
              <display-datetime
                :value="creationDate"
                format="fromNow"
                class="text-secondary-emphasis"
              />
            </div>
          </template>
        </document-card>
        <infinite-loading
          v-if="useInfiniteScroll"
          :identifier="infiniteScrollId"
          @infinite="loadNextPage"
        >
          <template #spinner>
            <span />
          </template>
          <template #complete>
            <span />
          </template>
        </infinite-loading>
        <div
          v-if="reachedTheEnd"
          class="text-muted p-3 text-center"
        >
          <span v-if="items.length">•</span>
          <span v-else>{{ t('widget.noRecommendations') }}</span>
        </div>
      </div>
    </app-wait>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import bodybuilder from 'bodybuilder'
import { compact, get, property, find, flatten, noop, uniqueId } from 'lodash'
import InfiniteLoading from 'v3-infinite-loading'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'
import EsDocList from '@/api/resources/EsDocList'
import AppWait from '@/components/AppWait/AppWait'
import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'
import DisplayUser from '@/components/Display/DisplayUser'
import DisplayDatetime from '@/components/Display/DisplayDatetime'

const props = defineProps({
  widget: {
    type: Object,
    default: () => ({})
  },
  project: {
    type: String,
    default: null
  },
  pageSize: {
    type: Number,
    default: 50
  }
})

const pages = ref([])
const hits = ref([])

const { t } = useI18n()
const { core } = useCore()
const { waitFor, loaderId } = useWait()
const infiniteScrollId = uniqueId('infinite-scroll-')

const items = computed(() => compact(flatten(pages.value).map(recordToItem)))
const documents = computed(() => flatten(hits.value.map(property('hits'))))
const offset = computed(() => pages.value.length * props.pageSize)
const lastPage = computed(() => pages.value[pages.value.length - 1])
const reachedTheEnd = computed(() => get(lastPage.value, 'length', 0) < props.pageSize)
const useInfiniteScroll = computed(() => offset.value > 0 && !reachedTheEnd.value)

function clearPages() {
  pages.value = []
  hits.value = []
}

function loadFirstPage() {
  clearPages()
  return loadPageWithLoader()
}

async function loadPage() {
  const page = await core.api.getDocumentUserRecommendations(offset.value, props.pageSize, props.project)
  const pageHits = await getPageHits(page)
  pages.value.push(page)
  hits.value.push(pageHits)
}

const loadPageWithLoader = waitFor(loadPage)

async function loadNextPage($infiniteLoadingState) {
  await loadPage()
  const method = reachedTheEnd.value ? 'complete' : 'loaded'
  get($infiniteLoadingState, method, noop)()
}

function recordToItem({ user, document: { id }, creationDate }) {
  const document = findDocument(id)
  return document ? { document, user, creationDate } : null
}

async function getPageHits(page) {
  const preference = 'widget-recommended-by'
  const body = getPageHitsBody(page)
  const index = props.project
  const response = await core.api.elasticsearch.search({ index, body, preference })
  return new EsDocList(response)
}

function getPageHitsBody(page) {
  const values = page.map(recommendation => recommendation.document.id)
  const excludes = ['content', 'content_translated']
  return bodybuilder().size(values.length).rawOption('_source', { excludes }).query('ids', { values }).build()
}

function findDocument(id) {
  return find(documents.value, { id })
}

onMounted(loadFirstPage)
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
