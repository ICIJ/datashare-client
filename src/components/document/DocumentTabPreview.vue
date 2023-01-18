<template>
  <div class="d-flex flex-grow-1 document__preview">
    <template v-if="!disabled && previewComponent">
      <component :is="importPreviewComponent" :document="document"></component>
    </template>
    <template v-else>
      <div class="p-3">
        {{ $t('document.notAvailable') }}
      </div>
    </template>
  </div>
</template>

<script>
import features from '@/mixins/features'

/**
 * A panel displaying a preview for a document.
 */
export default {
  name: 'DocumentTabPreview',
  mixins: [features],
  props: {
    /**
     * Disable the preview
     */
    disabled: {
      type: Boolean
    },
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  data() {
    return {
      paginatedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/html'
      ]
    }
  },
  computed: {
    isPaginated() {
      return this.paginatedTypes.indexOf(this.document.contentType) > -1
    },
    previewComponent() {
      switch (true) {
        case this.document.isJson:
          return 'JsonViewer'
        case this.isPaginated:
          return 'PaginatedViewer'
        case this.document.isTiff:
          return 'TiffViewer'
        case this.document.isSpreadsheet && this.hasFeature('SERVER_RENDERING_SPREADSHEET'):
          return 'SpreadsheetViewer'
        case this.document.isSpreadsheet:
          return 'LegacySpreadsheetViewer'
        case this.document.isImage:
          return 'ImageViewer'
        case this.document.isAudio:
          return 'AudioViewer'
        case this.document.isVideo:
          return 'VideoViewer'
        default:
          return null
      }
    }
  },
  methods: {
    importPreviewComponent() {
      return import('@/components/document/viewers/' + this.previewComponent + '.vue')
    }
  }
}
</script>
