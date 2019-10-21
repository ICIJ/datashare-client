<template>
  <div class="d-flex h-100">
    <template v-if="previewComponent">
      <component :is="previewComponent" :document="document" />
    </template>
    <template v-else>
      <div class="p-3">{{ $t('document.not_available') }}</div>
    </template>
  </div>
</template>

<script>
import features from '@/mixins/features'

export default {
  name: 'DocumentTabPreview',
  mixins: [features],
  props: {
    document: {
      type: Object
    }
  },
  data () {
    return {
      paginatedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/html'
      ],
      spreadsheetTypes: [
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/vnd.oasis.opendocument.spreadsheet-template',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
        'text/csv'
      ]
    }
  },
  methods: {
    previewComponent () {
      switch (true) {
        case this.isPaginatedViewerActivated && this.isPaginated:
          return import('@/components/document/viewers/PaginatedViewer')
        case this.isPdf:
          return import('@/components/document/viewers/PdfViewer')
        case this.isTiff:
          return import('@/components/document/viewers/TiffViewer')
        case this.isSpreadsheet && this.hasFeature('SERVER_RENDERING_SPREADSHEET'):
          return import('@/components/document/viewers/SpreadsheetViewer')
        case this.isSpreadsheet:
          return import('@/components/document/viewers/LegacySpreadsheetViewer')
        case this.isImage:
          return import('@/components/document/viewers/ImageViewer')
        default:
          return null
      }
    }
  },
  computed: {
    isPaginatedViewerActivated () {
      return !!this.$config.get('previewHost')
    },
    isPaginated () {
      return this.paginatedTypes.indexOf(this.document.contentType) > -1
    },
    isPdf () {
      return this.document.contentType === 'application/pdf'
    },
    isTiff () {
      return this.document.contentType === 'image/tiff'
    },
    isSpreadsheet () {
      return this.spreadsheetTypes.indexOf(this.document.contentType) > -1
    },
    isImage () {
      return this.document.contentType.indexOf('image/') === 0
    }
  }
}
</script>
