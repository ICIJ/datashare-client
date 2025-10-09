<template>
  <div
    class="widget widget--search-bar"
    :class="{ 'card-body': widget.card }"
  >
    <search-bar
      class="p-0"
      :indices="indices"
    />
  </div>
</template>

<script>
import { toRef } from 'vue'

import { useInsightsStore } from '@/store/modules'
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
    }
  },
  setup() {
    const insightsStore = useInsightsStore()
    const project = toRef(insightsStore, 'project')
    return { project }
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
