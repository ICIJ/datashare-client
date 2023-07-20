<template>
  <div class="widget widget--search-bar" :class="{ 'card-body': widget.card }">
    <search-bar class="p-0" />
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar'

/**
 * Widget to display a search bar
 */
export default {
  name: 'WidgetSearchBar',
  components: {
    SearchBar
  },
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    }
  }
}
</script>

<style lang="scss" scoped>
.widget--search-bar {
  min-height: 100%;
  display: flex;
  align-items: center;
}
</style>
