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
    <template v-else>
      {{ $t('document.not_available') }}
    </template>
  </div>
</template>

<script>
import ImageViewer from '@/components/document/viewers/ImageViewer'
import PdfViewer from '@/components/document/viewers/PdfViewer'
import SpreadsheetViewer from '@/components/document/viewers/SpreadsheetViewer'
import TiffViewer from '@/components/document/viewers/TiffViewer'

export default {
  name: 'DocumentTabPreview',
  components: {
    ImageViewer,
    PdfViewer,
    SpreadsheetViewer,
    TiffViewer
  },
  props: ['document'],
  computed: {
    isPdf () {
      return this.document.contentType === 'application/pdf'
    },
    isTiff () {
      return this.document.contentType === 'image/tiff'
    },
    isSpreadsheet () {
      return ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'].indexOf(this.document.contentType) > -1
    },
    documentThumbnailAtivated () {
      return this.$config.get('document-thumbnail.activated')
    },
    isImage () {
      return this.documentThumbnailAtivated && this.document.contentType.indexOf('image/') === 0
    }
  }
}
</script>

<style lang="scss">
</style>
