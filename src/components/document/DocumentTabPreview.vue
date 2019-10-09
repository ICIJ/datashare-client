<template>
  <div class="d-flex h-100">
    <template v-if="isPaginatedViewerActivated && isPaginated">
      <paginated-viewer :document="document" />
    </template>
    <template v-else-if="isPdf">
      <pdf-viewer :document="document" />
    </template>
    <template v-else-if="isTiff">
      <tiff-viewer :document="document" />
    </template>
    <template v-else-if="isSpreadsheet && hasFeature('SERVER_RENDERING_SPREADSHEET')">
      <spreadsheet-viewer :document="document" />
    </template>
    <template v-else-if="isSpreadsheet">
      <legacy-spreadsheet-viewer :document="document" />
    </template>
    <template v-else-if="isImage">
      <image-viewer :document="document" />
    </template>
    <template v-else>
      <div class="p-3">{{ $t('document.not_available') }}</div>
    </template>
  </div>
</template>

<script>
import ImageViewer from '@/components/document/viewers/ImageViewer'
import LegacySpreadsheetViewer from '@/components/document/viewers/LegacySpreadsheetViewer'
import PdfViewer from '@/components/document/viewers/PdfViewer'
import PaginatedViewer from '@/components/document/viewers/PaginatedViewer'
import SpreadsheetViewer from '@/components/document/viewers/SpreadsheetViewer'
import TiffViewer from '@/components/document/viewers/TiffViewer'
import features from '@/mixins/features'

export default {
  name: 'DocumentTabPreview',
  mixins: [
    features
  ],
  components: {
    ImageViewer,
    LegacySpreadsheetViewer,
    PaginatedViewer,
    PdfViewer,
    SpreadsheetViewer,
    TiffViewer
  },
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

<style lang="scss">
</style>
