<script setup>
import { reactive, ref, computed, onMounted, nextTick, useTemplateRef } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { findIndex, reduce } from 'lodash'
import bodybuilder from 'bodybuilder'

import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'
import EsDocList from '@/api/resources/EsDocList'
import AppWait from '@/components/AppWait/AppWait'
import AppSpinner from '@/components/AppSpinner/AppSpinner'
import DocumentTranslation from '@/components/Document/DocumentTranslation/DocumentTranslation'
import DisplayEmail from '@/components/Display/DisplayEmail'
import { useDocumentStore } from '@/store/modules'

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
const documentStore = useDocumentStore()
const { core } = useCore()
const { waitFor, loaderId } = useWait()

const thread = ref({ hits: [] })

const threadQueryFields = reactive({
  threadIndex: 'metadata.tika_metadata_message_raw_header_thread_index',
  messageId: 'metadata.tika_metadata_message_raw_header_message_id'
})

function isActive(email) {
  return email.id === props.document.id
}

const documentIndex = computed(() => {
  return findIndex(thread.value.hits, isActive)
})

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
  body.query('bool', (b) =>
    b.orQuery('match', 'contentType', 'application/vnd.ms-outlook').orQuery('regexp', 'contentType', 'message/.*')
  )
  // Similar subject
  body.query('query_string', {
    fields: ['metadata.tika_metadata_dc_subject', 'metadata.tika_metadata_subject'],
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
  const activeElementSelector = '.document-thread__list__email:not(:first-of-type).document-thread__list__email--active'
  const element = elementRef.value.$el.querySelector(activeElementSelector)
  // Do not scroll if the active element is not found
  if (!element) return
  // We assume the closest container is the one with overflow-auto class
  const container = element.closest('.overflow-auto') ?? window.document.body
  // Use the scroll-tracker component
  core.emit('scroll-tracker:request', { element, container })
}

const init = waitFor(async function () {
  // Load its thread (if any)
  thread.value = await getThread()
  thread.value.push('hits.hits', props.document.raw)
  thread.value.removeDuplicates()
  thread.value.orderBy('creationDate', ['asc'])
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
  } catch (_) {
    return EsDocList.none()
  }
}

onMounted(() => {
  documentStore.$onAction(({ name, after }) => {
    if (name === 'getContentSlice') {
      after(({ content }) => {
        thread.value.hits[documentIndex.value].content = content
      })
    }
  })

  init().then(scrollToActive)
})

onBeforeRouteUpdate(init)
</script>

<template>
  <app-wait ref="element" :for="loaderId">
    <template #waiting>
      <app-spinner class="d-flex mx-auto my-5" />
    </template>
    <div class="document-thread py-3">
      <ul class="list-unstyled document-thread__list m-0">
        <li
          v-for="email in thread.hits"
          :key="email.id"
          class="document-thread__list__email"
          :class="{ 'document-thread__list__email--active': isActive(email) }"
        >
          <router-link :to="{ name: 'document', params: email.routerParams }" class="p-3 d-block">
            <div class="d-flex text-nowrap gap-3">
              <div class="document-thread__list__email__from flex-grow-1">
                <display-email :value="email.messageFrom" tag="strong" />
              </div>
              <abbr
                v-if="email.creationDate"
                v-b-tooltip.body="{ delay: tooltipDelay }"
                class="document-thread__list__email__date"
                :title="email.creationDateHuman"
              >
                {{ $d(email.creationDate) }}
              </abbr>
            </div>
            <div class="d-flex gap-3">
              <span v-if="isActive(email) && email.messageTo" class="document-thread__list__email__to text-secondary">
                {{ $t('documentThread.to') }}
                <ul class="list-inline d-inline">
                  <li v-for="to in email.messageTo.split(',')" :key="to" class="list-inline-item">
                    <display-email :value="to" />
                  </li>
                </ul>
              </span>
              <span v-else class="document-thread__list__email__excerpt text-secondary w-100">
                {{ email.excerpt }}
              </span>
            </div>
          </router-link>
          <document-translation v-if="isActive(email)" :document="document" :q="q" class="mt-0 m-3" />
        </li>
      </ul>
    </div>
  </app-wait>
</template>

<style lang="scss" scoped>
.document-thread {
  &__list {
    margin: 0;
    padding: 0;

    &__email {
      border: 1px solid $border-color;

      &:not(:last-of-type) {
        margin-bottom: -1px;
      }

      &:first-of-type {
        border-top-left-radius: var(--bs-border-radius);
        border-top-right-radius: var(--bs-border-radius);
      }

      &:last-of-type {
        border-bottom-left-radius: var(--bs-border-radius);
        border-bottom-right-radius: var(--bs-border-radius);
      }

      & > a {
        color: $body-color;

        &:hover {
          text-decoration: none;
        }
      }

      &--active {
        position: relative;
        border-color: $primary;
      }

      &__to {
        .list-inline-item {
          &:after {
            content: ', ';
          }

          &:last-of-type:after {
            content: '';
          }
        }
      }
    }
  }
}
</style>
