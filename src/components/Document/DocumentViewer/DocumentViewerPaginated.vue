<template>
  <app-wait :for="loaderId" class="w-100 d-flex flex-column py-3 paginated-viewer">
    <template #waiting>
      <div class="p-3 w-100 text-muted">
        {{ t('document.fetching') }}
      </div>
    </template>
    <div v-if="document.isPdf" class="flex-grow-1">
      <iframe :src="document.inlineFullUrl" width="100%" height="100%" frameborder="0" allowfullscreen />
    </div>
    <div v-else-if="isPreviewable" class="d-flex flex-grow-1">
      <div class="paginated-viewer__thumbnails bg-tertiary-subtle">
        <div class="text-center p-2 d-flex align-items-center paginated-viewer__thumbnails__select">
          <select
            v-model.number="active"
            class="form-control form-control-sm"
            @change="scrollToPageAndThumbnail(active)"
          >
            <option v-for="page in pagesRange" :key="page" :value="page">
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
            <document-thumbnail :document="document" :page="page" size="md" fit />
            <span class="paginated-viewer__thumbnails__items__item__page">
              {{ page + 1 }}
            </span>
          </div>
        </div>
      </div>
      <div
        class="paginated-viewer__preview flex-grow-1 text-center d-flex flex-column flex-wrap align-items-center gap-5"
      >
        <div v-for="page in pagesRange" :key="page" class="paginated-viewer__preview__page w-100 text-center px-3">
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
    <div v-else class="p-3 text-center">
      {{ t('document.notAvailable') }}
    </div>
  </app-wait>
</template>

<script>
import { vIntersectionObserver } from '@vueuse/components'
import { get, range } from 'lodash'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

import { useWait } from '@/composables/useWait'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
import AppWait from '@/components/AppWait/AppWait'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'

/**
 * Display a paginated preview of a document using the preview server.
 */
export default {
  name: 'DocumentViewerPaginated',
  components: {
    AppWait,
    DocumentThumbnail
  },
  directives: {
    IntersectionObserver: vIntersectionObserver
  },
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  setup() {
    const { t } = useI18n()
    const { getPreviewMetaUrl } = useDocumentPreview()
    return { wait: useWait(), t, getPreviewMetaUrl }
  },
  data() {
    return {
      active: 0,
      errored: false,
      meta: {
        pages: 1
      }
    }
  },
  computed: {
    hasPreviewHost() {
      return !!this.$config.get('previewHost')
    },
    pagesRange() {
      return range(this.meta.pages)
    },
    metaOptions() {
      return {
        method: 'GET',
        cache: 'default',
        headers: {
          [this.sessionIdHeaderName]: this.sessionIdHeaderValue
        }
      }
    },
    loaderId() {
      return this.wait.loaderId
    },
    isPreviewable() {
      return this.hasPreviewHost && get(this, 'meta.previewable', false) && !this.errored
    }
  },
  async mounted() {
    if (this.hasPreviewHost) {
      await this.waitFor(async () => {
        try {
          this.meta = await this.fetchMeta()
        } catch (e) {
          throw Error('Unable to fetch the thumbnail informations')
        }
      })
    }
  },
  methods: {
    async waitFor(callback) {
      try {
        this.wait.start(this.loaderId)
        await callback()
      } finally {
        this.wait.end(this.loaderId)
      }
    },
    async fetchMeta() {
      const url = this.getPreviewMetaUrl(this.document)
      const { data } = await axios({ url, ...this.metaOptions })
      return data
    },
    onPageIntersectionObserver([entry]) {
      if (entry.isIntersecting) {
        const page = parseInt(entry.target.getAttribute('data-page'), 10) - 1
        if (this.active !== page) {
          this.setActiveAndScrollToThumbnail(page)
        }
      }
    },
    setActiveAndScrollToThumbnail(page) {
      this.active = page
      this.scrollToThumbnail(page)
    },
    setActiveAndScrollToPage(page) {
      this.active = page
      this.scrollToPage(page)
    },
    scrollToThumbnail(page) {
      const thumbnails = this.$el.querySelectorAll('.paginated-viewer__thumbnails__items__item')
      const target = thumbnails[page]
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    },
    scrollToPage(page) {
      const previews = this.$el.querySelectorAll('.paginated-viewer__preview__page')
      const target = previews[page]
      target.scrollIntoView({ behavior: 'instant', block: 'nearest' })
    },
    scrollToPageAndThumbnail(page) {
      this.scrollToPage(page)
      this.scrollToThumbnail(page)
    }
  }
}
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
