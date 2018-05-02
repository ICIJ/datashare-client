<template>
  <div class="tiff-viewer">
    <div class="tiff-viewer__header text-center" v-if="document.pages.length > 0">
      <button class="btn btn-default btn-sm" @click="rotatePage(document.active, -1)">
        <i class="fa fa-rotate-left"></i>
      </button>
      <button class="btn btn-default btn-sm" @click="rotatePage(document.active, 1)">
        <i class="fa fa-rotate-right"></i>
      </button>
      <div class="tiff-viewer__header__pages">
        Page <select class="form-control input-sm" v-model.number="document.active">
        <option v-for="page in document.pages.length" v-bind:key="page.address">
          {{ page }}
        </option>
      </select> of {{ document.pages.length }}
      </div>
    </div>
    <div v-if="page(document.active)" class="img-thumbnail">
      <div class="alert tiff-viewer__warning">
        <i class="fa fa-warning"></i> The browser preview of this TIFF file may not show all the images. We suggest you
        download it in your computer to view all the contents.
      </div>

      <img class="tiff-viewer__canvas img-responsive" :src="page(document.active).toDataURL()"/>
    </div>
    <div v-else class="alert">
      <i class="fa fa fa-cog fa-spin"></i>
      Generating preview...
    </div>
  </div>
</template>

<script>
import Tiff from 'tiff.js'

export default {
  name: 'tiff-viewer',
  props: ['url'],
  data () {
    return {
      document: {
        promise: null,
        active: 1,
        pages: []
      }
    }
  },
  created () {
    Tiff.initialize({TOTAL_MEMORY: 16777216 * 10})
  },
  methods: {
    rotatePage (p, direction = 1) {
      return this.rotate(this.document.pages[p - 1], direction).then(canvas => {
        // Canvas is ready, create an property for this page
        this.$set(this.document.pages, p - 1, canvas)
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
    },
    page (p) {
      // Change the active page
      this.$set(this.document, 'active', p)
      // Did we fetch this page already?
      if (this.document.pages[p - 1]) {
        return this.document.pages[p - 1]
      } else {
        // Asynchronous download of PDF
        this.tiff().then(tiff => {
          // Then return a new promise to paginate the result
          return this.render(tiff, p).then(canvas => {
            // Create an object for this PDF
            if (this.document.pages.length === 0) {
              this.$set(this.document, 'pages', new Array(tiff.countDirectory()))
            }
            // Canvas is ready, create an property for this page
            this.$set(this.document.pages, p - 1, canvas)
          })
        })
      }
    },
    tiff () {
      return new Promise((resolve, reject) => {
        if (this.document.promise) {
          this.document.promise.then(resolve)
        } else {
          // Asynchronous download of PDF
          this.document.promise = new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest()
            // Open the file using the prop's url
            xhr.open('GET', this.url, true)
            xhr.responseType = 'arraybuffer'
            // Bind onload on the XHR objct
            xhr.onload = function (e) {
              if (this.status === 200) {
                // Create the tiff
                resolve(new Tiff({buffer: xhr.response}))
              } else {
                reject(new Error('bad request status : ' + this.status))
              }
            }
            // Start the XMLHttpRequest
            xhr.send()
          })
          // Resolve the promise when the doc is loaded
          this.document.promise.then(resolve)
        }
      })
    },
    render (tiff, p) {
      return new Promise(resolve => {
        // Change tiff directory
        tiff.setDirectory(p)
        // Resolve the canvas
        resolve(tiff.toCanvas())
      })
    }
  }
}
</script>
