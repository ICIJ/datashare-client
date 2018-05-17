<template>
  <div class="pdf-viewer">
    <template v-if="doc.pages.length > 0">
      <div class="pdf-viewer__header">
        Page <select class="form-control input-sm" v-model="doc.active">
        <option v-for="page in doc.pages.length" v-bind:key="page.address">
          {{ page }}
        </option>
      </select> of {{ doc.pages.length }}
      </div>
      <div v-if="page(doc.active)">
        <img class="pdf-viewer__canvas img-responsive img-thumbnail" :src="page(doc.active)"/>
      </div>
    </template>
    <div v-else class="alert">
      <i class="fa fa fa-cog fa-spin"></i>
      {{ message }}
    </div>
  </div>
</template>

<script>
import PDFJS from 'pdfjs-dist'
import Worker from 'pdfjs-dist/build/pdf.worker'
(typeof window !== 'undefined' ? window : {}).pdfjsWorker = Worker

PDFJS.GlobalWorkerOptions.workerSrc = 'static/js/pdf.worker.js'

export default {
  name: 'pdf-viewer',
  props: ['url'],
  data () {
    return {
      message: 'Generating preview...',
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
            this.doc.pages = new Array(pdf.pdfInfo.numPages)
          }
          this.doc.active = p
          this.doc.pages[p - 1] = canvas.toDataURL()
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
        let loadingTask = PDFJS.getDocument(this.url)
        return loadingTask.promise.then(pdf => {
          this.pdf = pdf
          return pdf
        })
      }
    },
    renderPage (pdf, p) {
      return pdf.getPage(p).then(page => {
        const scale = 1.5
        const viewport = page.getViewport(scale)
        const canvas = document.createElement('canvas')
        const canvasContext = canvas.getContext('2d')

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {canvasContext, viewport}
        return page.render(renderContext).then(() => canvas)
      })
    }
  }
}
</script>
