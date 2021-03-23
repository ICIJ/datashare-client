<template>
  <v-wait for="load data paginated viewer" class="w-100 d-flex flex-column">
    <div class="p-3 w-100 text-muted" slot="waiting">
      {{ $t('document.fetching') }}
    </div>
    <div class="paginated-viewer d-flex flex-grow-1" v-if="meta.previewable">
      <div class="paginated-viewer__thumbnails">
        <div class="text-center p-2 d-flex align-items-center paginated-viewer__thumbnails__select">
          <select class="form-control form-control-sm" v-model.number="active" @change="scrollToPageAndThumbnail(active)">
            <option v-for="page in pagesRange" :key="page" :value="page">
              {{ page + 1 }}
            </option>
          </select>
          <span class="w-100">
            / {{ meta.pages }}
          </span>
        </div>
        <div class="paginated-viewer__thumbnails__items">
          <div v-for="page in pagesRange"
              @click="setActiveAndScrollToPage(page)"
               class="paginated-viewer__thumbnails__items__item m-2"
              :class="{ 'paginated-viewer__thumbnails__items__item--active': active === page }"
              :key="`thumbnail-${page}`">
            <document-thumbnail :document="document" size="150" :ratio="ratio" :page="page" lazy class="border-0" />
            <span class="paginated-viewer__thumbnails__items__item__page">
              {{ page + 1 }}
            </span>
          </div>
        </div>
      </div>
      <div class="paginated-viewer__preview flex-grow-1 p-2">
        <div v-for="page in pagesRange" :key="page" class="paginated-viewer__preview__page m-3" :data-page="page + 1">
          <document-thumbnail @enter="setActiveAndScrollToThumbnail(page)" :document="document" :size="1200" :ratio="ratio" :page="page" lazy />
        </div>
      </div>
    </div>
    <div class="p-3" v-else>
      {{ $t('document.notAvailable') }}
    </div>
  </v-wait>
</template>

<script>
import range from 'lodash/range'
import axios from 'axios'
import preview from '@/mixins/preview'

import DocumentThumbnail from '@/components/DocumentThumbnail.vue'

/**
 * Display a paginated preview of a document using the preview server.
 */
export default {
  name: 'PaginatedViewer',
  mixins: [preview],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  components: {
    DocumentThumbnail
  },
  data () {
    return {
      active: 0,
      meta: {
        pages: 1
      },
      size: {
        width: 0,
        height: 0
      }
    }
  },
  async mounted () {
    this.waitFor(async () => {
      this.$set(this, 'meta', await this.fetchMeta())
      this.$set(this, 'size', await this.fetchSize())
    })
  },
  methods: {
    async waitFor (callback) {
      this.$wait.start('load data paginated viewer')
      this.$Progress.start()
      await callback()
      this.$Progress.finish()
      this.$wait.end('load data paginated viewer')
    },
    async fetchSize () {
      const url = this.getPreviewUrl(this.document, { size: 150 })
      const base64 = await this.fetchPreviewAsBase64(url)
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.onerror = reject
        image.onload = () => resolve({ width: image.width, height: image.height })
        image.src = base64
      })
    },
    async fetchMeta () {
      const url = this.getPreviewMetaUrl(this.document)
      const { data } = await axios({ url, ...this.metaOptions })
      return data
    },
    setActiveAndScrollToThumbnail (page) {
      this.active = page
      this.scrollToThumbnail(page)
    },
    setActiveAndScrollToPage (page) {
      this.active = page
      this.scrollToPage(page)
    },
    scrollToThumbnail (page) {
      const thumbnails = this.$el.querySelectorAll('.paginated-viewer__thumbnails__items__item')
      const target = thumbnails[page]
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    },
    scrollToPage (page) {
      const previews = this.$el.querySelectorAll('.paginated-viewer__preview__page')
      const target = previews[page]
      target.scrollIntoView({ behavior: 'instant', block: 'nearest' })
    },
    scrollToPageAndThumbnail (page) {
      this.scrollToPage(page)
      this.scrollToThumbnail(page)
    }
  },
  computed: {
    ratio () {
      try {
        return this.size.height / this.size.width
      } catch (_) {
        return 1
      }
    },
    pagesRange () {
      return range(this.meta.pages)
    },
    metaOptions () {
      return {
        method: 'GET',
        cache: 'default',
        headers: {
          [this.sessionIdHeaderName]: this.sessionIdHeaderValue
        }
      }
    }
  }
}
</script>

<style lang="scss">
  .paginated-viewer {

    &__thumbnails {
      width: 150px;
      position: sticky;
      top: 0;
      display: flex;
      flex-direction: column;
      background: $light;
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
            border-color: $primary;
            box-shadow: 0 0 0 0.1em rgba($primary, .2);
          }

          &--active, &--active:hover {
            border-color: $secondary;
          }

          &--active &__page {
            background: $secondary;
            color: white;
          }

          &__page {
            background: $light;
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
          background: $light;
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

          &__image, &:before {
            border: $border-color 1px solid;
            background: $body-bg;
          }
        }
      }

    }
  }
</style>
