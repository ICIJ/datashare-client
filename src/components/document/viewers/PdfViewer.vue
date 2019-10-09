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
            <img :src="loadThumbnail(page)" />
            <span class="pdf-viewer__thumbnails__item__page">{{ page }}</span>
          </div>
        </div>
      </div>
      <div class="pdf-viewer__preview w-100 p-3">
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
import min from 'lodash/min'
import datashareSourceMixin from '@/mixins/datashareSourceMixin'

(typeof window !== 'undefined' ? window : {}).pdfjsWorker = Worker

PDFJS.GlobalWorkerOptions.workerSrc = 'static/js/pdf.worker.js'

export default {
  name: 'PdfViewer',
  props: ['document'],
  mixins: [datashareSourceMixin],
  data () {
    return {
      message: this.$t('document.generating_preview'),
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
    this.doc.active = 1
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
              this.doc.pages = new Array(pdf.numPages)
              this.numberOfThumbnails = min([this.doc.pages.length, 10])
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
          .catch(err => {
            this.message = err.message
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
    position: relative;
    min-height: 100%;

    &__thumbnails {
      min-width: 100px;

      &__item {
        position: relative;
        border:1px solid $border-color;
        cursor: pointer;

        &:hover {
          border-color: $primary;
          box-shadow:0 0 0 0.1em rgba($primary, .2);
        }

        &--active, &--active:hover {
          border-color: $secondary;
        }

        &--active &__page {
          background: $secondary;
          color: white;
        }

        &__page {
          position: absolute;
          bottom: 0;
          right: 0;
          background: $light;
          font-size: 0.8em;
          padding: 0.2em 0.4em;
          font-weight: bold;
          border:1px solid $border-color;
          border-right: 0;
          border-bottom: 0;
        }
      }
    }
  }
</style>
