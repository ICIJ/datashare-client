<script setup>
import { computed, ref, toValue, watch } from 'vue'
import bodybuilder from 'bodybuilder'
import { groupBy, property, trimStart, uniq } from 'lodash'
import { match } from 'path-to-regexp'

import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { SIZE } from '@/enums/sizes'
import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'
import ButtonToggleDay from '@/components/Button/ButtonToggleDay'
import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'
import DocumentCardPlaceholder from '@/components/Document/DocumentCard/DocumentCardPlaceholder'
import DocumentActionsGroup from '@/components/Document/DocumentActionsGroup/DocumentActionsGroup'
import DisplayTime from '@/components/Display/DisplayTime'
import EsDocList from '@/api/resources/EsDocList'
import { useStarredStore } from '@/store/modules'

const { events, loadingEvents } = defineProps({
  events: {
    type: Array
  },
  loadingEvents: {
    type: Boolean,
    default: false
  },
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail', 'path', 'creationDate']
  }
})

const { core } = useCore()
const { waitFor, isLoading: loadingDocuments } = useWait()
const starredStore = useStarredStore()
const { breakpointDown } = useBreakpoints()

const hits = ref([])
// This is a list of the ids of the events.
const eventsIds = computed(() => events.map(eventParams).map(property('id')))
const verticalDocumentActions = computed(() => breakpointDown.value[SIZE.LG])

// Either we are loading the documents or the events.
const loading = computed(() => toValue(loadingDocuments) || toValue(loadingEvents))

const entries = computed(() => {
  return (
    hits.value
      // This create a list of tuples where the first element is the document and the second is the event.
      .map((document) => {
        const event = events.find(event => eventParams(event).id === document.id)
        return [document, event]
      })
      // This filter out the documents that don't have a corresponding event.
      .filter(([, event]) => !!event)
  )
})

const groupedEntries = computed(() => {
  return groupBy(entries.value, ([, event]) => {
    const modificationDate = new Date(event.modificationDate)
    // The `toDateString` method returns only the date portion of the date.
    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toDateString
    // @example "Wed Jul 28 1993"
    return modificationDate.toDateString()
  })
})

const matchDocumentPath = match('/ds/:index/:id{/:routing}')

function eventParams({ uri }) {
  const path = `/${trimStart(uri.split('?').shift(0), '/')}`
  const { params } = matchDocumentPath(path)
  return params || {}
}

function buildEventsBody() {
  const values = eventsIds.value
  const excludes = ['content', 'content_translated']
  return bodybuilder()
    .size(values.length)
    .rawOption('_source', { excludes })
    .query('ids', { values })
    .sort('_script', {
      type: 'number',
      script: {
        source: 'params.order.indexOf(doc._id.value)',
        params: { order: values }
      }
    })
    .build()
}

const fetch = waitFor(async () => {
  if (!eventsIds.value.length) {
    return
  }
  const preference = 'search-history'
  const body = buildEventsBody()
  const indices = uniq(events.map(eventParams).map(property('index')))
  const index = indices.join(',')
  const response = await core.api.elasticsearch.search({ index, body, preference })
  await starredStore.fetchIndicesStarredDocuments(indices)
  hits.value = new EsDocList(response).hits
})

watch(() => eventsIds.value, fetch, { deep: true, immediate: true })
</script>

<template>
  <div
    v-if="loading"
    class="d-flex flex-column gap-3 mb-3"
  >
    <div class="text-center">
      <app-placeholder
        height="2.375rem"
        width="9rem"
      />
    </div>
    <document-card-placeholder :repeat="3" />
  </div>
  <b-collapse
    v-for="(entry, key) of groupedEntries"
    v-else
    :key="key"
    visible
  >
    <template #header="{ visible, toggle }">
      <div class="text-center mb-3 sticky-top">
        <button-toggle-day
          :date="key"
          :active="visible"
          @click="toggle"
        />
      </div>
    </template>
    <div class="d-flex flex-column gap-3 mb-3">
      <document-card
        v-for="([document, event], i) in entry"
        :key="i"
        modal
        route-name="document-standalone"
        :document="document"
        :properties="properties"
      >
        <template #actions>
          <div
            class="d-flex flex-column flex-lg-row-reverse align-items-end align-items-lg-center text-right gap-1 gap-lg-3"
          >
            <display-time
              :value="event.modificationDate"
              class="text-secondary"
            />
            <document-actions-group
              no-close
              :vertical="verticalDocumentActions"
              tooltip-placement="right-start"
              :document="document"
            />
          </div>
        </template>
      </document-card>
    </div>
  </b-collapse>
</template>
