<template>
  <div class="tiff-viewer">
    <template v-if="doc.pages.length > 0">
      <div class="tiff-viewer__header text-center">
        <button class="btn btn-default btn-sm" @click="rotatePage(doc.active, -1)">
          <i class="fa fa-rotate-left"></i>
        </button>
        <button class="btn btn-default btn-sm" @click="rotatePage(doc.active, 1)">
          <i class="fa fa-rotate-right"></i>
        </button>
        <div class="tiff-viewer__header__pages">
          Page <select class="form-control input-sm" v-model="doc.active">
          <option v-for="page in doc.pages.length" v-bind:key="page">
            {{ page }}
          </option>
        </select> of {{ doc.pages.length }}
        </div>
      </div>
      <div class="img-thumbnail">
        <div class="alert tiff-viewer__warning">
          <i class="fa fa-warning"></i> The browser preview of this TIFF file may not show all the images. We suggest
          you download it in your computer to view all the contents.
        </div>
        <img class="tiff-viewer__canvas img-responsive" :src="page(doc.active).toDataURL()"/>
      </div>
    </template>
    <div v-else class="alert"><i class="fa fa fa-cog fa-spin"></i>{{ message }}</div>
  </div>
</template>

<script>
import Tiff from 'tiff.js'
import 'whatwg-fetch'

export default {
  name: 'tiff-viewer',
  props: ['url'],
  data () {
    return {
      message: 'Generating preview...',
      tiff: null,
      doc: {
        active: 0,
        pages: []
      }
    }
  },
  created () {
    Tiff.initialize({TOTAL_MEMORY: 16777216 * 10})
  },
  methods: {
    page (p) {
      // Did we fetch this page already?
      if (this.doc.pages[p - 1]) {
        return this.doc.pages[p - 1]
      } else {
        if (this.tiff !== null) {
          return this.render(this.tiff, p)
        } else {
          return this.getTiff().then(tiff => {
            this.tiff = tiff
            // Then return a new promise to paginate the result
            return this.render(this.tiff, p).then(canvas => {
              if (this.doc.pages.length === 0) {
                this.doc.pages = new Array(this.tiff.countDirectory())
              }
              this.doc.pages[p - 1] = canvas
            })
          }).catch((err) => {
            this.message = err.message
          })
        }
      }
    },
    getTiff () {
      return fetch(this.url)
        .then((r) => {
          if (r.status >= 200 && r.status < 300) {
            return r
          } else {
            var error = new Error(`${r.status} ${r.statusText}`)
            error.response = r
            throw error
          }
        })
        .then((r) => r.arrayBuffer())
        .then((arrayBuffer) => new Tiff({buffer: arrayBuffer}))
    },
    render (tiff, p) {
      return new Promise(resolve => {
        // Change tiff directory
        tiff.setDirectory(p)
        this.doc.active = p
        resolve(tiff.toCanvas())
      })
    },
    rotatePage (p, direction = 1) {
      return this.rotate(this.doc.pages[p - 1], direction).then(canvas => {
        // Canvas is ready, create an property for this page
        this.$set(this.doc.pages, p - 1, canvas)
      })
    },
    rotate (canvas, direction = 1) {
      let ctx = canvas.getContext('2d')
      let cw = canvas.width
      let ch = canvas.height
      // Store current data to a temporary image
      let img = new Image()
      // Create a promise to return when the image is rotated
      let promise = new Promise(resolve => {
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
      img.src = canvas.toDataURL()
      return promise
    }
  }
}
</script>
