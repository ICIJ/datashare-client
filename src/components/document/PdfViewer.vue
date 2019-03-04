<template>
  <div class="pdf-viewer">
    <template v-if="doc.pages.length > 0">
      <div class="pdf-viewer__header">
        {{ $t('document.page') }}
        <select class="form-control input-sm" v-model.number="doc.active">
          <option v-for="page in doc.pages.length" :key="page.address">
            {{ page }}
          </option>
        </select>
        {{ $t('document.of') }} {{ doc.pages.length }}
      </div>
      <div v-if="page(doc.active)">
        <img class="pdf-viewer__canvas img-responsive img-thumbnail" :src="page(doc.active)"/>
      </div>
    </template>
    <div v-else class="alert">
      <font-awesome-icon icon="cog" spin />
      {{ message }}
    </div>
  </div>
</template>

<script>
import PDFJS from 'pdfjs-dist'
import Worker from 'pdfjs-dist/build/pdf.worker'
import DatashareClient from '@/api/DatashareClient'
(typeof window !== 'undefined' ? window : {}).pdfjsWorker = Worker

PDFJS.GlobalWorkerOptions.workerSrc = 'static/js/pdf.worker.js'

export default {
  name: 'pdf-viewer',
  props: ['document'],
  data () {
    return {
      message: this.$t('document.generating_preview'),
      pdf: null,
      doc: {
        active: 0,
        pages: []
      }
    }
  },
  mounted () {
    this.loadPage(1)
  },
  methods: {
    page (p) {
      // Did we fetch this page already?
      if (this.doc.pages[p - 1]) {
        this.doc.active = p
        return this.doc.pages[p - 1]
      } else {
        this.loadPage(p)
      }
    },
    loadPage (p) {
      return this.loadPdf().then(pdf => {
        return this.renderPage(pdf, p).then(canvas => {
          if (this.doc.pages.length === 0) {
            this.doc.pages = new Array(pdf.numPages)
          }
          this.doc.active = p
          this.$set(this.doc.pages, p - 1, canvas.toDataURL())
          return this.doc.pages[p - 1]
        })
      }).catch(err => {
        this.message = err.message
      })
    },
    loadPdf () {
      if (this.pdf !== null) {
        return new Promise((resolve) => resolve(this.pdf))
      } else {
        return PDFJS.getDocument(DatashareClient.getFullUrl(this.document.url)).then(pdf => {
          this.pdf = pdf
          return pdf
        })
      }
    },
    renderPage (pdf, p) {
      return pdf.getPage(p).then(page => {
        const scale = 3
        const viewport = page.getViewport(scale)
        const canvas = document.createElement('canvas')
        const canvasContext = canvas.getContext('2d')

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = { canvasContext, viewport }
        return page.render(renderContext).then(() => canvas)
      })
    }
  }
}
</script>
