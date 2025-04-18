<template>
  <app-wait :for="loaderId" class="w-100 d-flex flex-column py-3">
    <template #waiting>
      <div class="p-3 w-100 text-muted">
        {{ $t('document.fetching') }}
      </div>
    </template>
    <div v-if="document.isPdf" class="paginated-viewer paginated-viewer--pdf flex-grow-1">
      <iframe
        class="paginated-viewer__iframe border"
        :src="document.inlineFullUrl"
        width="100%"
        height="100%"
        frameborder="0"
        allowfullscreen
      />
    </div>
    <div v-else-if="isPreviewable" class="paginated-viewer paginated-viewer--previewable d-flex flex-grow-1">
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
            <document-thumbnail class="border-0" :document="document" :page="page" :ratio="ratio" size="150" />
            <span class="paginated-viewer__thumbnails__items__item__page">
              {{ page + 1 }}
            </span>
          </div>
        </div>
      </div>
      <div class="paginated-viewer__preview flex-grow-1 p-2">
        <div v-for="page in pagesRange" :key="page" class="paginated-viewer__preview__page m-3" :data-page="page + 1">
          <document-thumbnail
            :document="document"
            lazy
            :page="page"
            :ratio="ratio"
            :size="1200"
            @enter="setActiveAndScrollToThumbnail(page)"
            @errored.once="errored = true"
          />
        </div>
      </div>
    </div>
    <div v-else class="paginated-viewer paginated-viewer--not-available p-3 text-center">
      {{ $t('document.notAvailable') }}
    </div>
  </app-wait>
</template>

<script>
import { get, range } from 'lodash'
import axios from 'axios'

import { useWait } from '@/composables/useWait'
import AppWait from '@/components/AppWait/AppWait'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'
import preview from '@/mixins/preview'

/**
 * Display a paginated preview of a document using the preview server.
 */
export default {
  name: 'DocumentViewerPaginated',
  components: {
    AppWait,
    DocumentThumbnail
  },
  mixins: [preview],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  setup() {
    return { wait: useWait() }
  },
  data() {
    return {
      active: 0,
      errored: false,
      meta: {
        pages: 1
      },
      size: {
        width: 0,
        height: 0
      }
    }
  },
  computed: {
    hasPreviewHost() {
      return !!this.$config.get('previewHost')
    },
    ratio() {
      try {
        return this.size.height / this.size.width
      } catch (_) {
        return 1
      }
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
          this.size = await this.fetchSize()
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
    async fetchSize() {
      const url = this.getPreviewUrl(this.document, { size: 150 })
      const { src } = await this.fetchImageAsBase64(url)
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.onerror = reject
        image.onload = () => resolve({ width: image.width, height: image.height })
        image.src = src
      })
    },
    async fetchMeta() {
      const url = this.getPreviewMetaUrl(this.document)
      const { data } = await axios({ url, ...this.metaOptions })
      return data
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
    max-height: calc(100vh - var(--search-document-navbar-height));

    .document-standalone & {
      max-height: 100vh;
    }

    &__items {
      height: 100%;
      overflow: auto;

      &__item {
        border: 1px solid $border-color;
        cursor: pointer;
        position: relative;

        .document-thumbnail__image {
          max-width: 100%;
          width: 100%;
        }

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
          border: 1px solid $border-color;
          border-bottom: 0;
          border-right: 0;
          bottom: 0;
          font-size: 0.8em;
          font-weight: bold;
          padding: 0.2em 0.4em;
          position: absolute;
          right: 0;
        }
      }
    }
  }

  &__preview {
    text-align: center;

    &__page {
      position: relative;

      &:after {
        content: attr(data-page);
        background: var(--bs-tertiary-bg-subtle);
        border: 1px solid $border-color;
        bottom: 0;
        font-size: 0.8rem;
        font-weight: bold;
        padding: 0.2em 0.4em;
        position: absolute;
        right: 0;
      }

      .document-thumbnail {
        background: transparent;

        &__image,
        &:before {
          border: $border-color 1px solid;
          background: $body-bg;
        }
      }
    }
  }
}
</style>
