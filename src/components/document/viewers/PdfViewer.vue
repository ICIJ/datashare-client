<template>
  <div class="pdf-viewer d-flex">
    <template v-if="doc.pages.length > 0">
      <div id="pdf-viewer__header" class="bg-light px-3 py-2" @scroll="fetchMoreThumbnails">
        <div id="pdf-viewer__thumbnails" class="pdf-viewer__thumbnails">
          <div class="text-center mt-2 mb-4 d-flex align-items-center viewer__thumbnails__header">
            <select class="form-control form-control-sm" v-model.number="doc.active">
              <option v-for="page in doc.pages.length" :key="page">
                {{ page }}
              </option>
            </select>
            <span class="w-100">
              / {{ doc.pages.length }}
            </span>
          </div>
          <div v-for="page in numberOfThumbnails" :key="page" @click="doc.active = page" class="my-2 pdf-viewer__thumbnails__item" :class="{ 'pdf-viewer__thumbnails__item--active': doc.active === page }">
            <img :src="loadThumbnail(page)" alt="thumbnail of the PDF page">
            <span class="pdf-viewer__thumbnails__item__page">{{ page }}</span>
          </div>
        </div>
      </div>
      <div class="pdf-viewer__preview w-100 p-3">
        <div v-if="loadPage(doc.active)">
          <img class="pdf-viewer__preview__canvas img-responsive img-thumbnail" :src="loadPage(doc.active)" alt="preview of the PDF active page">
        </div>
      </div>
    </template>
    <div v-else class="alert">
      <fa icon="cog" spin></fa>
      {{ message }}
    </div>
  </div>
</template>

<script>
import PDFJS from 'pdfjs-dist'
import Worker from 'pdfjs-dist/build/pdf.worker'
import min from 'lodash/min'
import datashareSourceMixin from '@/mixins/datashareSourceMixin'

(typeof window !== 'undefined' ? window : {}).pdfjsWorker = Worker

/**
 * Display a preview of a PDF document.
 */
export default {
  name: 'PdfViewer',
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  mixins: [datashareSourceMixin],
  data () {
    return {
      message: this.$t('document.generatingPreview'),
      pdf: null,
      doc: {
        active: 0,
        pages: [],
        thumbs: []
      },
      numberOfThumbnails: 0
    }
  },
  mounted () {
    this.$set(this.doc, 'active', 1)
    this.loadPage(1)
  },
  methods: {
    fetchMoreThumbnails () {
      const isBottomOfScrollReached = document.getElementById('pdf-viewer__header').scrollTop + document.getElementById('pdf-viewer__header').offsetHeight >= document.getElementById('pdf-viewer__thumbnails').offsetHeight
      if (isBottomOfScrollReached && this.numberOfThumbnails !== this.doc.pages.length) {
        this.numberOfThumbnails = min([this.doc.pages.length, this.numberOfThumbnails + 10])
      }
    },
    loadPdf () {
      if (this.pdf !== null) {
        return new Promise(resolve => resolve(this.pdf))
      } else {
        return this.getSource(this.document)
          .then(r => r.arrayBuffer())
          .then(arrayBuffer => {
            const pdf = PDFJS.getDocument(new Uint8Array(arrayBuffer))
            return pdf.promise
          })
          .then(pdf => {
            if (this.doc.pages.length === 0) {
              this.$set(this.doc, 'pages', new Array(pdf.numPages))
              this.numberOfThumbnails = min([this.doc.pages.length, 10])
            }
            this.$set(this, 'pdf', pdf)
            return pdf
          })
      }
    },
    loadPage (page) {
      if (this.doc.pages[page - 1]) {
        return this.doc.pages[page - 1]
      } else {
        return this.loadPdf()
          .then(pdf => this.renderPage(pdf, page))
          .catch(error => {
            this.$set(this, 'message', error.message)
          })
      }
    },
    renderPage (pdf, p) {
      return pdf.getPage(p).then(page => {
        const viewport = page.getViewport({ scale: 3 })
        const canvas = document.createElement('canvas')
        canvas.height = viewport.height
        canvas.width = viewport.width
        const render = page.render({ canvasContext: canvas.getContext('2d'), viewport })
        return render.promise.then(() => {
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
          .catch(error => {
            this.$set(this, 'message', error.message)
          })
      }
    },
    renderThumbnail (pdf, p) {
      return pdf.getPage(p).then(page => {
        const viewport = page.getViewport({ scale: 1 })
        const canvas = document.createElement('canvas')
        canvas.width = 96
        canvas.height = 137
        const scale = Math.min(canvas.width / viewport.width, canvas.height / viewport.height)
        const render = page.render({ canvasContext: canvas.getContext('2d'), viewport: page.getViewport({ scale }) })
        return render.promise.then(() => {
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
    min-height: 100%;
    position: relative;

    &__thumbnails {
      min-width: 100px;

      &__item {
        border: 1px solid $border-color;
        cursor: pointer;
        position: relative;

        &:hover {
          border-color: $primary;
          box-shadow: 0 0 0 0.1em rgba($primary, .2);
        }

        &--active, &--active:hover {
          border-color: $secondary;
        }

        &--active &__page {
          background: $secondary;
          color: white;
        }

        &__page {
          background: $light;
          border: 1px solid $border-color;
          border-bottom: 0;
          border-right: 0;
          bottom: 0;
          font-size: 0.8em;
          font-weight: bold;
          padding: 0.2em 0.4em;
          position: absolute;
          right: 0;
        }
      }
    }
  }
</style>
