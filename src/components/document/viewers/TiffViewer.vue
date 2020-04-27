<template>
  <div class="tiff-viewer">
    <template v-if="doc.pages.length > 0">
      <div class="tiff-viewer__header">
        <div class="tiff-viewer__thumbnails">
          <div class="text-center mb-4">{{ doc.active }} / {{ doc.pages.length }}</div>
          <div v-for="page in doc.pages.length" :key="page" @click="doc.active = page" class="mr-2 my-2 d-flex flex-row-reverse">
            <img class="ml-1 tiff-viewer__canvas img-responsive" :width="thumbWidth" :height="thumbWidth" :src="loadPage(page)" />
            <span class="d-flex align-items-center">{{ page }}</span>
          </div>
        </div>
      </div>
      <div class="tiff-viewer__preview text-center">
        <div class="tiff-viewer__preview__pages d-flex flex-row-reverse">
          <select class="form-control input-sm w-auto mb-3" v-model="doc.active">
            <option v-for="page in doc.pages.length" v-bind:key="page">
              {{ page }}
            </option>
          </select>
        </div>
        <button class="btn btn-default btn-sm" @click="rotatePage(doc.active, -1)">
          <fa icon="undo" class="float-right" />
        </button>
        <button class="btn btn-default btn-sm" @click="rotatePage(doc.active, 1)">
          <fa icon="redo" class="float-right" />
        </button>
        <div class="img-thumbnail">
          <div class="alert tiff-viewer__warning">
            <fa icon="exclamation-triangle" />
            {{ $t('document.tiffLimitations') }}
          </div>
          <img class="tiff-viewer__canvas img-responsive" :width="maxWidth" :src="loadPage(doc.active)" />
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
import Tiff from 'tiff.js'
import datashareSourceMixin from '@/mixins/datashareSourceMixin'

export default {
  name: 'TiffViewer',
  props: ['document'],
  mixins: [datashareSourceMixin],
  data () {
    return {
      message: this.$t('document.generatingPreview'),
      maxWidth: 750,
      thumbWidth: 80,
      tiff: null,
      doc: {
        active: 0,
        pages: []
      }
    }
  },
  created () {
    Tiff.initialize({ TOTAL_MEMORY: 16777216 * 10 })
  },
  mounted () {
    this.doc.active = 1
    this.loadPage(1)
  },
  methods: {
    loadPage (p) {
      if (this.doc.pages[p - 1]) {
        return this.doc.pages[p - 1].toDataURL()
      } else {
        return this.render(this.tiff, p).then(canvas => {
          this.$set(this.doc.pages, p - 1, canvas)
        }).catch(error => {
          this.message = error.message
        })
      }
    },
    render (tiff, p) {
      if (tiff !== null) {
        return new Promise(resolve => {
          tiff.setDirectory(p - 1)
          resolve(tiff.toCanvas())
        })
      } else {
        return this.getTiff().then(tiff => {
          this.tiff = tiff
          this.doc.pages = new Array(this.tiff.countDirectory())
          return new Promise(resolve => {
            tiff.setDirectory(p - 1)
            resolve(tiff.toCanvas())
          })
        })
      }
    },
    getTiff () {
      return this.getSource(this.document)
        .then(r => r.arrayBuffer())
        .then(arrayBuffer => new Tiff({ buffer: arrayBuffer }))
    },
    rotatePage (p, direction = 1) {
      return this.rotate(this.doc.pages[p - 1], direction).then(canvas => {
        this.$set(this.doc.pages, p - 1, canvas)
      })
    },
    rotate (canvas, direction = 1) {
      const ctx = canvas.getContext('2d')
      const cw = canvas.width
      const ch = canvas.height
      // Store current data to a temporary image
      let img = new Image()
      // Create a promise to return when the image is rotated
      const promise = new Promise(resolve => {
        img.onload = () => {
          // Reset the canvas with new dimensions
          canvas.width = ch
          canvas.height = cw
          ctx.save()
          ctx.translate(ch / 2, cw / 2)
          // Clockwise rotation
          if (direction === 1) {
            ctx.rotate(90 * Math.PI / 180)
            // Counterclockwise rotation
          } else {
            ctx.rotate(-90 * Math.PI / 180)
          }
          // Draw the previows image, now rotated
          ctx.drawImage(img, cw / -2, ch / -2)
          ctx.restore()
          // Clear the temporary image
          img = null
          resolve(canvas)
        }
      })
      // Change the image src to start loading the image
      img.src = canvas.toDataURL ? canvas.toDataURL() : null
      return promise
    }
  }
}
</script>

<style lang="scss">
.tiff-viewer {
  position: relative;

  .tiff-viewer__header {
    flex: 0 0 15%;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    overflow: auto;
  }

  .tiff-viewer__preview {
    flex: 0 0 85%;
    margin-left: 15%;
    padding-left: 1em;
  }
}
</style>
