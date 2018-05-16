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
      <img class="pdf-viewer__canvas img-responsive img-thumbnail" :src="page(doc.active).toDataURL()"/>
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
      doc: {
        active: 0,
        pages: []
      }
    }
  },
  mounted () {
    this.page(1)
  },
  methods: {
    page (p) {
      // Did we fetch this page already?
      if (this.doc.pages[p - 1]) {
        return this.doc.pages[p - 1]
      } else {
        return this.loadPdf().then(pdf => {
          return this.render(pdf, p).then(canvas => {
            if (this.doc.pages.length === 0) {
              this.$set(this.doc, 'pages', new Array(pdf.pdfInfo.numPages))
            }
            this.$set(this.doc, 'active', p)
            this.$set(this.doc.pages, p - 1, canvas)
            return this.doc.pages[p - 1]
          })
        }).catch(err => {
          this.message = err.message
        })
      }
    },
    loadPdf () {
      let loadingTask = PDFJS.getDocument(this.url)
      return loadingTask.promise
    },
    render (pdf, p) {
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
