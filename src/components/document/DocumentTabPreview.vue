<template>
  <div class="d-flex h-100">
    <template v-if="isPdf">
      <pdf-viewer :document="document" />
    </template>
    <template v-else-if="isTiff">
      <tiff-viewer :document="document" />
    </template>
    <template v-else-if="isSpreadsheet">
      <spreadsheet-viewer :document="document" />
    </template>
    <template v-else-if="isImage">
      <image-viewer :document="document" />
    </template>
    <template v-else class="px-4 py-3">
      {{ $t('document.not_available') }}
    </template>
  </div>
</template>

<script>
import ImageViewer from '@/components/document/ImageViewer'
import PdfViewer from '@/components/document/PdfViewer'
import SpreadsheetViewer from '@/components/document/SpreadsheetViewer'
import TiffViewer from '@/components/document/TiffViewer'

export default {
  name: 'DocumentTabPreview',
  components: {
    ImageViewer,
    PdfViewer,
    SpreadsheetViewer,
    TiffViewer
  },
  props: {
    document: {
      type: Object
    }
  },
  computed: {
    isPdf () {
      return this.document.contentType === 'application/pdf'
    },
    isTiff () {
      return this.document.contentType === 'image/tiff'
    },
    isSpreadsheet () {
      return ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'].indexOf() > -1
    },
    isImage () {
      return this.document.contentType.indexOf('image/') === 0
    }
  }
}
</script>

<style lang="scss">
</style>
