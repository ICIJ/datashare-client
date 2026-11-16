<template>
  <app-wait
    ref="componentRoot"
    :for="loaderId"
    class="w-100 d-flex flex-column py-3 paginated-viewer"
  >
    <template #waiting>
      <div class="p-3 w-100 text-muted">
        {{ t('document.fetching') }}
      </div>
    </template>
    <div
      v-if="isPreviewable"
      class="d-flex flex-column flex-grow-1"
      :style="style"
    >
      <document-toolbox
        v-if="hasPagination"
        ref="toolbox"
        v-model:page="currentPage"
        no-search
        :document="document"
        :total-pages="meta.pages"
      />
      <div
        class="paginated-viewer__preview flex-grow-1 text-center d-flex flex-column flex-wrap align-items-center gap-5"
      >
        <div
          v-for="index in pagesRange"
          :key="index"
          class="paginated-viewer__preview__page w-100 text-center px-3"
        >
          <document-thumbnail
            v-intersection-observer="[onPageIntersectionObserver, { threshold: 0.5 }]"
            class="border d-inline-block"
            :data-page="index + 1"
            :document="document"
            lazy
            fit
            :page="index"
            size="xl"
            @errored.once="errored = index === 0"
          />
        </div>
      </div>
    </div>
    <div
      v-else
      class="p-3 text-center"
    >
      {{ t('document.notAvailable') }}
    </div>
  </app-wait>
</template>

<script setup>
import { ref, computed, onMounted, useTemplateRef } from 'vue'
import { vIntersectionObserver } from '@vueuse/components'
import { useDebounceFn, useEventListener } from '@vueuse/core'
import get from 'lodash/get'
import range from 'lodash/range'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { useConfig } from '@/composables/useConfig'

import { useWait } from '@/composables/useWait'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
import AppWait from '@/components/AppWait/AppWait'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'

/**
 * Display a paginated preview of a document using the preview server.
 */
const props = defineProps({
  document: {
    type: Object,
    default: () => ({})
  }
})

const { t } = useI18n()
const { getPreviewMetaUrl, sessionIdHeaderName, sessionIdHeaderValue } = useDocumentPreview()
const wait = useWait()
const config = useConfig()

const page = ref(1)
const errored = ref(false)
const meta = ref({
  pages: 1
})

const hasPreviewHost = computed(() => {
  return !!config.get('previewHost')
})

const pagesRange = computed(() => {
  return range(meta.value.pages)
})

const metaOptions = computed(() => {
  return {
    method: 'GET',
    cache: 'default',
    headers: {
      [sessionIdHeaderName.value]: sessionIdHeaderValue.value
    }
  }
})

const loaderId = computed(() => {
  return wait.loaderId
})

const isPreviewable = computed(() => {
  return hasPreviewHost.value && get(meta.value, 'previewable', false) && !errored.value
})

async function waitFor(callback) {
  try {
    wait.start(loaderId.value)
    await callback()
  }
  finally {
    wait.end(loaderId.value)
  }
}

async function fetchMeta() {
  const url = getPreviewMetaUrl(props.document)
  const { data } = await axios({ url, ...metaOptions.value })
  return data
}

const hasPagination = computed(() => meta.value.pages > 1)

const toolbox = useTemplateRef('toolbox')
const toolboxHeight = computed(() => toolbox.value?.height ?? 0)

const style = computed(() => {
  return {
    '--paginated-viewer-toolbox-height': `${toolboxHeight.value}px`
  }
})

const SCROLL_IDLE_DELAY = 200

const halfVisiblePages = new Set()
const pendingPage = ref(null)

function topmostHalfVisiblePage() {
  return halfVisiblePages.size ? Math.min(...halfVisiblePages) : page.value
}

function onPageIntersectionObserver([entry]) {
  const value = parseInt(entry.target.getAttribute('data-page'), 10)
  if (entry.intersectionRatio >= 0.5) {
    halfVisiblePages.add(value)
  }
  else {
    halfVisiblePages.delete(value)
  }
  if (pendingPage.value === null) {
    page.value = topmostHalfVisiblePage()
  }
}

const componentRoot = ref(null)

function scrollPageIntoView(value, behavior) {
  const previews = componentRoot.value.$el.querySelectorAll('.paginated-viewer__preview__page')
  const target = previews[value - 1]
  target?.scrollIntoView({ behavior, block: 'start' })
}

const settleScroll = useDebounceFn(() => {
  if (pendingPage.value === null) {
    return
  }
  // Pages above the target load lazily during the smooth scroll and push it down.
  scrollPageIntoView(pendingPage.value, 'instant')
  pendingPage.value = null
}, SCROLL_IDLE_DELAY)

function releasePendingPage() {
  pendingPage.value = null
  page.value = topmostHalfVisiblePage()
}

useEventListener(window, 'scroll', settleScroll, { capture: true, passive: true })
useEventListener(window, ['wheel', 'touchmove', 'pointerdown'], releasePendingPage, { passive: true })

function scrollToPage(value) {
  page.value = value
  pendingPage.value = value
  scrollPageIntoView(value, 'auto')
  settleScroll()
}

const currentPage = computed({
  get: () => page.value,
  set: scrollToPage
})

onMounted(async () => {
  if (hasPreviewHost.value) {
    await waitFor(async () => {
      try {
        meta.value = await fetchMeta()
      }
      catch {
        throw Error('Unable to fetch the thumbnail informations')
      }
    })
  }
})
</script>

<style lang="scss">
.paginated-viewer {
  min-height: 90vh;

  &__preview__page {
    scroll-margin-top: var(--paginated-viewer-toolbox-height, 0px);
  }
}
</style>
