<template>
  <app-overlay
    class="tiff-viewer w-100 py-3"
    :class="classList"
    :show="isLoading"
    :bg-color="'transparent'"
    spinner-small
  >
    <div
      v-if="!isLoading"
      class="d-flex align-items-start"
    >
      <div
        v-if="hasPages"
        class="tiff-viewer__thumbnails"
      >
        <div
          v-for="page in pages.length"
          :key="page"
          class="tiff-viewer__thumbnails__item mb-3"
          :class="{ 'tiff-viewer__thumbnails__item--active': page === active }"
          @click="activate(page)"
        >
          <div class="tiff-viewer__thumbnails__item__thumbnail">
            <img
              class="img-responsive"
              :width="thumbWidth"
              :height="thumbWidth"
              :src="getPage(page)"
            >
            <div class="tiff-viewer__thumbnails__item__thumbnail__page text-center small">
              <span class="badge">{{ page }}</span>
            </div>
          </div>
        </div>
      </div>
      <dismissable-content-warning
        v-if="!error"
        v-model:show="blurred"
        no-center
        content-class="tiff-viewer__preview"
      >
        <div class="tiff-viewer__preview__controls">
          <button-row-action
            class="tiff-viewer__preview__controls__button"
            :label="t('documentViewerImage.rotateCounterClockwise')"
            :icon-left="PhArrowCounterClockwise"
            @click="rotateActivePage(active, -1)"
          />
          <button-row-action
            class="tiff-viewer__preview__controls__button"
            :label="t('documentViewerImage.rotateClockwise')"
            :icon-left="PhArrowClockwise"
            @click="rotateActivePage(active, 1)"
          />
        </div>
        <img
          class="tiff-viewer__preview__canvas mw-100 mb-3"
          :src="getPage(active)"
        >
      </dismissable-content-warning>
      <div
        v-else
        class="tiff-viewer__error fw-bold text-center text-danger flex-grow-1"
      >
        {{ error }}
      </div>
    </div>
  </app-overlay>
</template>

<script>
import { Image } from 'image-js'
import { useI18n } from 'vue-i18n'
import * as tiff from 'tiff'

import { useDocumentPreview } from '@/composables/useDocumentPreview'
import AppOverlay from '@/components/AppOverlay/AppOverlay'
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import DismissableContentWarning from '@/components/Dismissable/DismissableContentWarning'
import datashareSourceMixin from '@/mixins/datashareSourceMixin'

/**
 * Display a Tiff preview of a document using tiff library
 */
export default {
  name: 'DocumentViewerTiff',
  components: {
    AppOverlay,
    ButtonRowAction,
    DismissableContentWarning
  },
  mixins: [datashareSourceMixin],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  setup() {
    const { isBlurred } = useDocumentPreview()
    const { t } = useI18n()
    return { isBlurred, t }
  },
  data() {
    return {
      error: null,
      thumbWidth: 80,
      tiffData: null,
      active: 1,
      pages: [],
      blurred: true
    }
  },
  computed: {
    isLoading() {
      return !this.tiffData && !this.error
    },
    hasPages() {
      return this.pages.length > 1
    },
    classList() {
      return {
        'tiff-viewer--blurred': this.blurred
      }
    }
  },
  async mounted() {
    try {
      this.blurred = await this.isBlurred(this.document)
      this.tiffData = tiff.decode(await this.getTiffBuffer())
      this.pages = []
      for (const index in this.tiffData) {
        this.pages.push(await this.renderPage(index))
      }
    }
    catch (error) {
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
  --tiff-viewer-thumbnails-item-filter: none;

  &--blurred {
    --tiff-viewer-thumbnails-item-filter: blur(1rem);
  }

  &__thumbnails {
    width: 80px;
    flex: 80px 0 0;
    text-align: center;
    margin-right: $spacer;

    &__item {
      margin: auto;
      cursor: pointer;

      &--active &__thumbnail {
        border-color: $input-focus-border-color;

        &__page .badge {
          background-color: $input-focus-border-color;
        }
      }

      &__thumbnail {
        display: inline-block;
        position: relative;
        overflow: hidden;
        border: 2px solid transparent;

        &:hover {
          border-color: $input-focus-border-color;
        }

        &__page .badge {
          background: $dark;
          position: absolute;
          bottom: 0.25rem;
          right: 0.25rem;
        }

        & > img {
          filter: var(--tiff-viewer-thumbnails-item-filter);
        }
      }
    }
  }

  &__preview {
    display: flex;
    flex-direction: column;
    gap: $spacer;

    &__controls {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      opacity: 0.25;
      display: flex;
      justify-content: center;
      gap: $spacer-xxs;

      &:hover {
        opacity: 1;
      }

      &__button {
        --bs-btn-bg: var(--bs-btn-hover-bg);
        --bs-btn-active-shadow: none;
      }
    }
  }
}
</style>
