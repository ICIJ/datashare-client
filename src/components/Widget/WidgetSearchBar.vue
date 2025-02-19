<template>
  <div class="widget widget--search-bar" :class="{ 'card-body': widget.card }">
    <search-bar class="p-0" :indices="indices" />
  </div>
</template>

<script>
import SearchBar from '@/components/Search/SearchBar/SearchBar'

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
    },
    /**
     * The project name.
     */
    project: {
      type: String,
      required: true
    }
  },
  computed: {
    indices() {
      return [this.project]
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
