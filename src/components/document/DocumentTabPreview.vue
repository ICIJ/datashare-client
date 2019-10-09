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
import PdfViewer from '@/components/document/viewers/PdfViewer'
import PaginatedViewer from '@/components/document/viewers/PaginatedViewer'
import LegacySpreadsheetViewer from '@/components/document/viewers/LegacySpreadsheetViewer'
import TiffViewer from '@/components/document/viewers/TiffViewer'

export default {
  name: 'DocumentTabPreview',
  components: {
    ImageViewer,
    PaginatedViewer,
    PdfViewer,
    LegacySpreadsheetViewer,
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
      return ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'].indexOf(this.document.contentType) > -1
    },
    isImage () {
      return this.document.contentType.indexOf('image/') === 0
    }
  }
}
</script>

<style lang="scss">
</style>
