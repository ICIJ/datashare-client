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
      class="d-flex flex-column"
    >
      <document-toolbox
        v-if="hasPages"
        v-model:page="active"
        no-search
        :document="document"
        :total-pages="pages.length"
        :disabled="blurred"
      />
      <dismissable-content-warning
        v-if="!errorMessage"
        v-model:show="blurred"
        :description="blurredContent"
        no-center
        content-class="tiff-viewer__preview"
      >
        <div class="tiff-viewer__preview__controls">
          <button-row-action
            class="tiff-viewer__preview__controls__button"
            :label="t('documentViewerImage.rotateCounterClockwise')"
            :icon-left="IPhArrowCounterClockwise"
            @click="rotateActivePage(active, -1)"
          />
          <button-row-action
            class="tiff-viewer__preview__controls__button"
            :label="t('documentViewerImage.rotateClockwise')"
            :icon-left="IPhArrowClockwise"
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
        {{ errorMessage }}
      </div>
    </div>
  </app-overlay>
</template>

<script>
import { encodeDataURL, getImageFromIFD } from 'image-js'
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import * as tiff from 'tiff'

import IPhArrowCounterClockwise from '~icons/ph/arrow-counter-clockwise'
import IPhArrowClockwise from '~icons/ph/arrow-clockwise'

import { useDocumentBlur } from '@/composables/useDocumentBlur'
import AppOverlay from '@/components/AppOverlay/AppOverlay'
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import DismissableContentWarning from '@/components/Dismissable/DismissableContentWarning'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import datashareSourceMixin from '@/mixins/datashareSourceMixin'

/**
 * Display a Tiff preview of a document using tiff library
 */
export default {
  name: 'DocumentViewerTiff',
  components: {
    AppOverlay,
    ButtonRowAction,
    DismissableContentWarning,
    DocumentToolbox
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
  setup(props) {
    const currentDocument = toRef(props, 'document')
    const { blurred, blurredContent, error: blurError } = useDocumentBlur(currentDocument, { initial: true })
    const { t } = useI18n()
    return { blurred, blurredContent, blurError, t, IPhArrowCounterClockwise, IPhArrowClockwise }
  },
  data() {
    return {
      error: null,
      tiffData: null,
      active: 1,
      pages: []
    }
  },
  computed: {
    isLoading() {
      return !this.tiffData && !this.error
    },
    errorMessage() {
      return this.error ?? this.blurError?.message
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
        return encodeDataURL(this.pages[index])
      }
    },
    async renderPage(index = this.active - 1) {
      return getImageFromIFD(this.tiffData[index])
    },
    async getTiffBuffer() {
      const response = await this.$core.api.getSource(this.document, { responseType: 'blob' })
      return await response.arrayBuffer()
    },
    async rotateActivePage(page, direction = 1) {
      const index = page - 1
      this.pages[index] = this.pages[index].rotate(direction === 1 ? 90 : -90)
    }
  }
}
</script>

<style lang="scss">
.tiff-viewer {
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
