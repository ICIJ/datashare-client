<template>
  <div class="document-content-slices">
    <dynamic-scroller
      :buffer="scrollBuffer"
      :items="slices"
      :min-item-size="85"
      ref="scroller"
      page-mode>
      <template v-slot="{ item, index, active }">
        <dynamic-scroller-item
          :active="active"
          :data-index="index"
          :item="item"
          tag="span">
          <component
            :is="item | sliceComponent"
            :slice="item"
            @visible="onPlaceholderVisible" />
        </dynamic-scroller-item>
      </template>
    </dynamic-scroller>
  </div>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import DocumentContentSlicePlaceholder from './DocumentContentSlicePlaceholder'
import DocumentContentSlice from './DocumentContentSlice'

export default {
  name: 'DocumentContentSlices',
  components: {
    DynamicScroller,
    DynamicScrollerItem
  },
  props: {
    slices: {
      type: Array,
      default: () => ([])
    }
  },
  filters: {
    sliceComponent ({ placeholder = false } = {}) {
      return placeholder ? DocumentContentSlicePlaceholder : DocumentContentSlice
    }
  },
  computed: {
    scrollBuffer () {
      // Huge buffer to ensure all views are created
      return 9e3 * this.slices.length
    }
  },
  methods: {
    onPlaceholderVisible (slice) {
      this.$emit('placeholder-visible', slice)
    },
    scrollToContentSlice (sliceIndex) {
      return this.$refs?.scroller?.scrollToItem(sliceIndex)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '~node_modules/vue-virtual-scroller/dist/vue-virtual-scroller.css';
</style>
