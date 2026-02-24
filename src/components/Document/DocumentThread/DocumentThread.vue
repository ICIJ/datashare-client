<script setup>
import { computed, nextTick, onMounted, reactive, ref, useTemplateRef } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { reduce } from 'lodash'
import bodybuilder from 'bodybuilder'

import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'
import EsDocList from '@/api/resources/EsDocList'
import AppWait from '@/components/AppWait/AppWait'
import DocumentThreadEntry from './DocumentThreadEntry'

const props = defineProps({
  document: {
    type: Object
  },
  q: {
    type: String,
    default: ''
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})

const elementRef = useTemplateRef('element')
const core = useCore()
const { waitFor, loaderId } = useWait()

const thread = ref({ hits: [] })
const expandedIds = ref(new Set())

const threadQueryFields = reactive({
  threadIndex: 'metadata.tika_metadata_message_raw_header_thread_index',
  messageId: 'metadata.tika_metadata_message_raw_header_message_id'
})

function isActive(email) {
  return email.id === props.document.id
}

function isExpanded(email) {
  return isActive(email) || expandedIds.value.has(email.id)
}

function toggleEmail(email) {
  if (isActive(email)) return
  if (expandedIds.value.has(email.id)) {
    expandedIds.value.delete(email.id)
  }
  else {
    expandedIds.value.add(email.id)
  }
}

const threadBody = computed(() => {
  const body = bodybuilder()
  // Creation date is the date when the email was sent
  body.sort('metadata.tika_metadata_dcterms_created', 'asc')
  body.rawOption('highlight', {
    fields: {
      content: {
        no_match_size: 280
      }
    }
  })
  // Select only the Documents and not the NamedEntities
  body.query('match', 'type', 'Document')
  // Select only the Documents at the same extraction level
  body.query('match', 'extractionLevel', props.document.extractionLevel)
  // Select emails only
  body.query('bool', b =>
    b.orQuery('match', 'contentType', 'application/vnd.ms-outlook').orQuery('regexp', 'contentType', 'message/.*')
  )
  // Similar subject
  body.query('query_string', {
    fields: ['metadata.tika_metadata_dc_subject', 'metadata.tika_metadata_subject'],
    // eslint-disable-next-line no-useless-escape
    query: `.*\"${props.document.cleanSubject}\".*`
  })
  // Collect all field data
  return reduce(
    threadQueryFields,
    (body, path, field) => {
      const value = props.document[field]
      if (value) body.query('match', path, value)
      return body
    },
    body
  )
})

async function scrollToActive() {
  await nextTick()
  // For the first email, we go to the top of the page
  const activeElementSelector = '.document-thread-entry:not(:first-of-type).document-thread-entry--active'
  const element = elementRef.value.$el.querySelector(activeElementSelector)
  // Do not scroll if the active element is not found
  if (!element) return
  // Use the scroll-tracker component
  core.emit('scroll-tracker:request', { element })
}

const init = waitFor(async function () {
  // Load its thread (if any)
  thread.value = await getThread()
  thread.value.push('hits.hits', props.document.raw)
  thread.value.removeDuplicates()
  thread.value.orderBy('creationDate', ['asc'])
  expandedIds.value.clear()
})

async function getThread() {
  try {
    if (threadBody.value) {
      const raw = await core.api.elasticsearch.search({
        _source_excludes: 'content,content_translated',
        index: props.document.index,
        body: threadBody.value.build()
      })
      return new EsDocList(raw)
    }
    return EsDocList.none()
  }
  catch {
    return EsDocList.none()
  }
}

onMounted(async () => {
  await init()
  await scrollToActive()
})

onBeforeRouteUpdate(init)

defineExpose({ getThread, init, thread, isActive, isExpanded, toggleEmail })
</script>

<template>
  <app-wait
    ref="element"
    :for="loaderId"
  >
    <template #waiting>
      <app-spinner class="d-flex mx-auto my-5" />
    </template>
    <div class="document-thread py-3">
      <ul class="list-unstyled document-thread__list m-0">
        <document-thread-entry
          v-for="email in thread.hits"
          :key="email.id"
          :email="email"
          :active="isActive(email)"
          :expanded="isExpanded(email)"
          :document="document"
          :q="q"
          :tooltip-delay="tooltipDelay"
          @toggle="toggleEmail(email)"
        />
      </ul>
    </div>
  </app-wait>
</template>

<style lang="scss" scoped>
.document-thread {
  &__list {
    margin: 0;
    padding: 0;
  }
}
</style>
