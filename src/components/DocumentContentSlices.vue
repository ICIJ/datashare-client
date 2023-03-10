<template>
  <div class="document-content-slices">
    <dynamic-scroller
      :key="version"
      ref="scroller"
      :buffer="scrollBuffer"
      :items="slices"
      :min-item-size="85"
      page-mode
    >
      <template #default="{ item, index, active }">
        <dynamic-scroller-item :active="active" :data-index="index" :item="item" tag="span">
          <component :is="item | sliceComponent" :slice="item" @visible="onPlaceholderVisible" />
        </dynamic-scroller-item>
      </template>
    </dynamic-scroller>
  </div>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

import DocumentContentSlicePlaceholder from './DocumentContentSlicePlaceholder'
import DocumentContentSlice from './DocumentContentSlice'

import { hasOverflow, getTranslateValues } from '@/utils/style'

export default {
  name: 'DocumentContentSlices',
  components: {
    DynamicScroller,
    DynamicScrollerItem
  },
  filters: {
    sliceComponent({ placeholder = false } = {}) {
      return placeholder ? DocumentContentSlicePlaceholder : DocumentContentSlice
    }
  },
  props: {
    slices: {
      type: Array,
      default: () => []
    },
    bufferizeAll: {
      type: Boolean
    }
  },
  data() {
    return {
      version: 0
    }
  },
  computed: {
    scrollBuffer() {
      // Huge buffer to ensure all views are created
      return this.bufferizeAll ? 9e3 * this.slices.length : 300
    },
    scrollableContainer() {
      let container = this.$el.parentElement
      while (container && !hasOverflow(container)) {
        container = container?.parentElement
      }
      return container || window
    }
  },
  watch: {
    bufferizeAll() {
      this.version++
    }
  },
  methods: {
    onPlaceholderVisible(slice) {
      this.$emit('placeholder-visible', slice)
    },
    scrollToContentSlice(sliceIndex) {
      const el = this.$el.querySelectorAll('.vue-recycle-scroller__item-view')[sliceIndex]
      const { y: top } = getTranslateValues(el)
      this.scrollableContainer.scrollTo({ top })
      this.onPlaceholderVisible(this.slices[sliceIndex])
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~node_modules/vue-virtual-scroller/dist/vue-virtual-scroller.css';
</style>
