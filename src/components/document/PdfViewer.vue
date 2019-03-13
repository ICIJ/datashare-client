<template>
  <div class="pdf-viewer d-flex">
    <template v-if="doc.pages.length > 0">
      <div class="pdf-viewer__header">
        <div class="pdf-viewer__thumbnails">
          <div class="text-center mb-4">{{ doc.active }} / {{ doc.pages.length }}</div>
          <div v-for="page in doc.pages.length" :key="page" @click="doc.active = page" class="mr-2 my-2 d-flex flex-row-reverse">
            <img class="ml-1 border border-primary" :src="loadThumbnail(page)" />
            <span class="d-flex align-items-center">{{ page }}</span>
          </div>
        </div>
      </div>
      <div class="pdf-viewer__preview">
        <div class="pdf-viewer__preview__header">
          <select class="form-control input-sm w-auto float-right mb-3" v-model.number="doc.active">
            <option v-for="page in doc.pages.length" :key="page">
              {{ page }}
            </option>
          </select>
        </div>
        <div v-if="loadPage(doc.active)">
          <img class="pdf-viewer__preview__canvas img-responsive img-thumbnail" :src="loadPage(doc.active)"/>
        </div>
      </div>
    </template>
    <div v-else class="alert">
      <fa icon="cog" spin />
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
        pages: [],
        thumbs: []
      }
    }
  },
  mounted () {
    this.doc.active = 1
    this.loadPage(1)
  },
  methods: {
    loadPdf () {
      if (this.pdf !== null) {
        return new Promise(resolve => resolve(this.pdf))
      } else {
        return PDFJS.getDocument(DatashareClient.getFullUrl(this.document.url)).then(pdf => {
          if (this.doc.pages.length === 0) {
            this.doc.pages = new Array(pdf.numPages)
          }
          this.pdf = pdf
          return pdf
        })
      }
    },
    loadPage (p) {
      if (this.doc.pages[p - 1]) {
        return this.doc.pages[p - 1]
      } else {
        return this.loadPdf()
          .then(pdf => this.renderPage(pdf, p))
          .catch(err => {
            this.message = err.message
          })
      }
    },
    renderPage (pdf, p) {
      return pdf.getPage(p).then(page => {
        const viewport = page.getViewport(3)
        const canvas = document.createElement('canvas')
        canvas.height = viewport.height
        canvas.width = viewport.width
        return page.render({ canvasContext: canvas.getContext('2d'), viewport }).then(() => {
          this.$set(this.doc.pages, p - 1, canvas.toDataURL())
          return this.doc.pages[p - 1]
        })
      })
    },
    loadThumbnail (p) {
      if (this.doc.thumbs[p - 1]) {
        return this.doc.thumbs[p - 1]
      } else {
        return this.loadPdf()
          .then(pdf => this.renderThumbnail(pdf, p))
          .catch(err => {
            this.message = err.message
          })
      }
    },
    renderThumbnail (pdf, p) {
      return pdf.getPage(p).then(page => {
        const viewport = page.getViewport(1)
        const canvas = document.createElement('canvas')
        canvas.width = 96
        canvas.height = 137
        const scale = Math.min(canvas.width / viewport.width, canvas.height / viewport.height)
        return page.render({ canvasContext: canvas.getContext('2d'), viewport: page.getViewport(scale) }).then(() => {
          this.$set(this.doc.thumbs, p - 1, canvas.toDataURL())
          return this.doc.thumbs[p - 1]
        })
      })
    }
  }
}
</script>

<style lang="scss">
.pdf-viewer {
  position: relative;

  .pdf-viewer__header {
    flex: 0 0 15%;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    overflow: auto;
  }

  .pdf-viewer__preview {
    flex: 0 0 85%;
    margin-left: 15%;
  }
}
</style>
