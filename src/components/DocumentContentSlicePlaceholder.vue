<script>
import 'intersection-observer'
import { random } from 'lodash'

export default {
  name: 'DocumentContentSlicePlaceholder',
  props: {
    slice: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      observer: null,
      contentPlaceholderRows: [
        {
          height: '1em',
          boxes: [[0, '100%']]
        }
      ]
    }
  },
  mounted () {
    return this.bindObserver()
  },
  methods: {
    async bindObserver () {
      this.observer = this.createObserver()
      // Ensure the element is mounted before binding it to the observer
      await this.$nextTick()
      // Observe the component element
      this.observer.observe(this.$el)
    },
    createObserver () {
      return new IntersectionObserver(async entries => {
        if (entries[0].isIntersecting) {
          /**
             * The placeholder enters the viewport.
             *
             * @event visible
             */
          this.$emit('visible', this.slice)
        }
      })
    },
    rowStyle () {
      const width = `${random(10, 100)}%`
      return { width }
    }
  }
}
</script>

<template>
  <div class="document-content-slice-placeholder">
    <div v-for="i in 20" :key="i" v-once>
      <content-placeholder :rows="contentPlaceholderRows" class="p-0 my-3" :style="rowStyle()" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .document-content-slice-placeholder {
    min-height: 60vh;
  }
</style>
