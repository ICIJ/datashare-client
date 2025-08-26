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
      class="d-flex flex-grow-1"
    >
      <div class="paginated-viewer__thumbnails bg-tertiary-subtle">
        <div class="text-center p-2 d-flex align-items-center paginated-viewer__thumbnails__select">
          <select
            v-model.number="active"
            class="form-control form-control-sm"
            @change="scrollToPageAndThumbnail(active)"
          >
            <option
              v-for="page in pagesRange"
              :key="page"
              :value="page"
            >
              {{ page + 1 }}
            </option>
          </select>
          <span class="w-100"> / {{ meta.pages }} </span>
        </div>
        <div class="paginated-viewer__thumbnails__items">
          <div
            v-for="page in pagesRange"
            :key="`thumbnail-${page}`"
            class="paginated-viewer__thumbnails__items__item m-2"
            :class="{ 'paginated-viewer__thumbnails__items__item--active': active === page }"
            @click="setActiveAndScrollToPage(page)"
          >
            <document-thumbnail
              :document="document"
              :page="page"
              size="md"
              fit
            />
            <span class="paginated-viewer__thumbnails__items__item__page">
              {{ page + 1 }}
            </span>
          </div>
        </div>
      </div>
      <div
        class="paginated-viewer__preview flex-grow-1 text-center d-flex flex-column flex-wrap align-items-center gap-5"
      >
        <div
          v-for="page in pagesRange"
          :key="page"
          class="paginated-viewer__preview__page w-100 text-center px-3"
        >
          <document-thumbnail
            v-intersection-observer="[onPageIntersectionObserver, { threshold: 0.5 }]"
            class="border d-inline-block"
            :data-page="page + 1"
            :document="document"
            lazy
            fit
            :page="page"
            size="xl"
            @errored.once="errored = page === 0"
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
import { ref, computed, onMounted } from 'vue'
import { vIntersectionObserver } from '@vueuse/components'
import { get, range } from 'lodash'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { useConfig } from '@/composables/useConfig'

import { useWait } from '@/composables/useWait'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
import AppWait from '@/components/AppWait/AppWait'
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

const active = ref(0)
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

function onPageIntersectionObserver([entry]) {
  if (entry.isIntersecting) {
    const page = parseInt(entry.target.getAttribute('data-page'), 10) - 1
    if (active.value !== page) {
      setActiveAndScrollToThumbnail(page)
    }
  }
}

function setActiveAndScrollToThumbnail(page) {
  active.value = page
  scrollToThumbnail(page)
}

function setActiveAndScrollToPage(page) {
  active.value = page
  scrollToPage(page)
}

// Create refs for the component root element
const componentRoot = ref(null)

function scrollToThumbnail(page) {
  const thumbnails = componentRoot.value.querySelectorAll('.paginated-viewer__thumbnails__items__item')
  const target = thumbnails[page]
  target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

function scrollToPage(page) {
  const previews = componentRoot.value.querySelectorAll('.paginated-viewer__preview__page')
  const target = previews[page]
  target.scrollIntoView({ behavior: 'instant', block: 'nearest' })
}

function scrollToPageAndThumbnail(page) {
  scrollToPage(page)
  scrollToThumbnail(page)
}

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

  &__thumbnails {
    width: 150px;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    max-height: 100vh;

    &__items {
      height: 100%;
      overflow: auto;

      &__item {
        border: 1px solid $border-color;
        cursor: pointer;
        position: relative;
        display: flex;

        &:hover {
          border-color: $action;
          box-shadow: 0 0 0 0.1em rgba($action, 0.2);
        }

        &--active,
        &--active:hover {
          border-color: $primary;
        }

        &--active &__page {
          background: $primary;
          color: white;
        }

        &__page {
          background: $tertiary;
          bottom: 0;
          font-size: 0.8rem;
          font-weight: bold;
          padding: 0.2em 0.4em;
          position: absolute;
          right: 0;
        }
      }
    }
  }

  &__preview__page > .document-thumbnail:before {
    content: attr(data-page);
    position: absolute;
    background: $tertiary;
    bottom: 0;
    font-size: 0.8rem;
    font-weight: bold;
    padding: 0.2em 0.4em;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
}
</style>
