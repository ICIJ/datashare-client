<template>
  <div class="tiff-viewer w-100">
    <b-overlay :show="isLoading" opacity="0.6" rounded spinner-small class="m-3">
      <div class="tiff-viewer__header bg-light d-flex algin-items-center p-3">
        <div v-if="hasPages" class="tiff-viewer__header__pagination text-muted">
          <span class="badge text-bg-dark">
            <span class="">
              {{ active }}
            </span>
            <span class="fw-normal"> / {{ pages.length }} </span>
          </span>
        </div>
        <div class="tiff-viewer__header__pagination__actions flex-grow-1 text-end">
          <div class="btn-group">
            <button class="btn btn-outline-primary" @click="rotateActivePage(active, -1)">
              <fa icon="arrow-rotate-left" class="float-end" />
            </button>
            <button class="btn btn-outline-primary" @click="rotateActivePage(active, 1)">
              <fa icon="arrow-rotate-right" class="float-end" />
            </button>
          </div>
        </div>
      </div>
    </b-overlay>
    <div v-if="!isLoading" class="d-flex mx-3">
      <div v-if="hasPages" class="tiff-viewer__thumbnails ms-3">
        <div
          v-for="page in pages.length"
          :key="page"
          class="tiff-viewer__thumbnails__item mb-3"
          :class="{ 'tiff-viewer__thumbnails__item--active': page === active }"
          @click="activate(page)"
        >
          <div class="tiff-viewer__thumbnails__item__thumbnail">
            <img class="img-responsive" :width="thumbWidth" :height="thumbWidth" :src="getPage(page)" />
            <div class="tiff-viewer__thumbnails__item__thumbnail__page text-center small">
              <span class="badge">{{ page }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!error" class="tiff-viewer__preview text-center flex-grow-1">
        <img class="tiff-viewer__preview__canvas mw-100 mb-3" :src="getPage(active)" />
      </div>
      <div v-else class="tiff-viewer__error fw-bold text-center text-danger flex-grow-1">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { Image } from 'image-js'
import * as tiff from 'tiff'

import datashareSourceMixin from '@/mixins/datashareSourceMixin'

/**
 * Display a Tiff preview of a document using tiff library
 */
export default {
  name: 'TiffViewer',
  mixins: [datashareSourceMixin],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  data() {
    return {
      error: null,
      thumbWidth: 80,
      tiffData: null,
      active: 1,
      pages: []
    }
  },
  computed: {
    isLoading() {
      return !this.tiffData && !this.error
    },
    hasPages() {
      return this.pages.length > 1
    }
  },
  async mounted() {
    try {
      const buffer = await this.getTiffBuffer()
      this.tiffData = tiff.decode(buffer)
      this.pages = []
      for (const index in this.tiffData) {
        this.pages.push(await this.renderPage(index))
      }
    } catch (error) {
      this.error = error.message
    }
  },
  methods: {
    getPage(page = this.active) {
      const index = page - 1
      if (this.pages[index]) {
        return this.pages[index].toDataURL()
      }
    },
    async renderPage(index = this.active - 1) {
      const { width, height, data, alpha, samplesPerPixel: components } = this.tiffData[index]
      // Create an Image object with image-js
      const image = new Image(width, height, { data, components, alpha })
      // Convert the image to a Data URL
      return image
    },
    async getTiffBuffer() {
      const response = await this.$core.api.getSource(this.document, { responseType: 'blob' })
      return await response.arrayBuffer()
    },
    async rotateActivePage(page, direction = 1) {
      const index = page - 1
      this.pages[index] = this.pages[index].rotate(direction === 1 ? 90 : -90)
    },
    activate(page) {
      this.active = page
    }
  }
}
</script>

<style lang="scss">
.tiff-viewer {
  &__header {
    &__pagination {
      width: 100px;
      flex: 100px 0 0;
      text-align: center;
      font-size: 1.25rem;
    }
  }

  &__thumbnails {
    width: 100px;
    flex: 100px 0 0;
    text-align: center;

    &__item {
      margin: auto;
      cursor: pointer;

      &--active &__thumbnail {
        box-shadow: 0 0 0 2px $input-focus-border-color;

        &__page .badge {
          background-color: $input-focus-border-color;
        }
      }

      &__thumbnail {
        display: inline-block;
        position: relative;

        &:hover {
          box-shadow: 0 0 0 2px $input-focus-border-color, 0 0 $spacer * 0.5 0 $input-focus-border-color;
        }

        &__page .badge {
          background: $dark;
          position: absolute;
          bottom: 0.25rem;
          right: 0.25rem;
        }
      }
    }
  }
}
</style>
