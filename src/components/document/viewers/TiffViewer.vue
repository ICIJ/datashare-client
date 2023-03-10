<template>
  <div class="tiff-viewer w-100 d-flex">
    <template v-if="pages.length">
      <div class="tiff-viewer__thumbnails bg-light p-3">
        <div class="text-center mb-4">{{ active }} / {{ pages.length }}</div>
        <div v-for="page in pages.length" :key="page" class="tiff-viewer__thumbnails__item mb-3" @click="active = page">
          <img class="ml-1 img-responsive" :width="thumbWidth" :height="thumbWidth" :src="getPage(page)" />
          <div class="tiff-viewer__thumbnails__item__page text-center small">
            <span class="badge badge-dark">{{ page }}</span>
          </div>
        </div>
      </div>
      <div class="tiff-viewer__preview text-center flex-grow-1 px-3">
        <div class="p-3">
          <div class="btn-group">
            <button class="btn btn-outline-primary" @click="rotateActivePage(active, -1)">
              <fa icon="undo" class="float-right" />
            </button>
            <button class="btn btn-outline-primary" @click="rotateActivePage(active, 1)">
              <fa icon="redo" class="float-right" />
            </button>
          </div>
        </div>
        <img class="tiff-viewer__preview__canvas mw-100 mb-3" :width="maxWidth" :src="getPage(active)" />
      </div>
    </template>
    <div v-else-if="error" class="tiff-viewer__error alert alert-danger m-3">
      {{ error }}
    </div>
    <div v-else class="tiff-viewer__loader alert">
      <fa icon="cog" spin />
      {{ $t('document.generatingPreview') }}
    </div>
  </div>
</template>

<script>
import { range } from 'lodash'
import Tiff from 'tiff.js'

import datashareSourceMixin from '@/mixins/datashareSourceMixin'

/**
 * Display a Tiff preview of a document
 */
export default {
  name: 'TiffViewer',
  mixins: [datashareSourceMixin],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  data() {
    return {
      error: null,
      maxWidth: 750,
      thumbWidth: 80,
      tiff: null,
      active: 1,
      pages: []
    }
  },
  created() {
    Tiff.initialize({ TOTAL_MEMORY: 16777216 * 10 })
  },
  async mounted() {
    try {
      this.tiff = await this.getTiff()
      for (const page of range(1, this.tiff.countDirectory() + 1)) {
        this.pages.push(await this.renderPage(page))
      }
    } catch (error) {
      this.error = error.message
    }
  },
  methods: {
    getPage(page = this.active) {
      if (this.pages[page - 1]) {
        return this.pages[page - 1].toDataURL()
      }
    },
    renderPage(page = this.active) {
      this.tiff.setDirectory(page - 1)
      return this.tiff.toCanvas()
    },
    async getTiff() {
      const r = await this.$core.api.getSource(this.document, { responseType: 'blob' })
      const buffer = await r.arrayBuffer()
      return new Tiff({ buffer })
    },
    async rotateActivePage(page, direction = 1) {
      const canvas = await this.rotate(this.pages[page - 1], direction)
      this.$set(this.pages, page - 1, canvas)
    },
    rotate(canvas, direction = 1) {
      const ctx = canvas.getContext('2d')
      const cw = canvas.width
      const ch = canvas.height
      // Store current data to a temporary image
      let img = new Image()
      // Create a promise to return when the image is rotated
      const promise = new Promise((resolve) => {
        img.onload = () => {
          // Reset the canvas with new dimensions
          canvas.width = ch
          canvas.height = cw
          ctx.save()
          ctx.translate(ch / 2, cw / 2)
          // Clockwise rotation
          if (direction === 1) {
            ctx.rotate((90 * Math.PI) / 180)
            // Counterclockwise rotation
          } else {
            ctx.rotate((-90 * Math.PI) / 180)
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
      img.src = canvas?.toDataURL()
      return promise
    }
  }
}
</script>

<style lang="scss">
.tiff-viewer {
  &__thumbnails {
    &__item {
      position: relative;
      cursor: pointer;

      &:hover {
        box-shadow: 0 0 0 1px $input-focus-border-color, 0 0 $spacer * 0.5 0 $input-focus-border-color;
      }

      &__page {
        position: absolute;
        bottom: 0.25rem;
        right: 0.25rem;
      }
    }
  }
}
</style>
