<template>
  <div class="pdf-viewer">
    <div class="pdf-viewer__header" v-if="document.pages.length > 1">
      Page <select class="form-control input-sm" v-model.number="document.active">
      <option v-for="page in document.pages.length" v-bind:key="page.address">
        {{ page }}
      </option>
    </select> of {{ document.pages.length }}
    </div>
    <div v-if="page(document.active)">
      <img class="pdf-viewer__canvas img-responsive img-thumbnail" :src="page(document.active)"/>
    </div>
    <div v-else class="alert">
      <i class="fa fa fa-cog fa-spin"></i>
      Generating preview...
    </div>
  </div>
</template>

<script>
import PDFJS from 'pdfjs-dist'

export default {
  name: 'pdf-viewer',
  props: ['url', 'workerSrc'],
  data () {
    return {
      doc: {
        promise: null,
        active: 1,
        pages: []
      }
    }
  },
  methods: {
    page (p) {
      this.$set(this.doc, 'active', p)
      // Did we fetch this page already?
      if (this.doc.pages[p - 1]) {
        return this.doc.pages[p - 1]
      } else {
        this.pdf().then(pdf => {
          return this.render(pdf, p).then(canvas => {
            if (this.doc.pages.length === 0) {
              this.$set(this.doc, 'pages', new Array(pdf.pdfInfo.numPages))
            }
            this.$set(this.doc.pages, p - 1, canvas.toDataURL())
          })
        })
      }
    },
    pdf () {
      return new Promise((resolve, reject) => {
        if (this.doc.promise) {
          this.doc.promise.then(resolve)
        } else {
          PDFJS.workerSrc = this.workerSrc
          this.doc.promise = PDFJS.getDocument(this.url).promise
          this.doc.promise.then(resolve)
        }
      })
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
