<template>
  <div class="widget widget--search-bar" :class="{ 'card-body': widget.card }">
    <search-bar class="p-0" :indices="indices" />
  </div>
</template>

<script>
import { castArray } from 'lodash'

import SearchBar from '@/components/Search/SearchBar/SearchBar'
import { useInsightsStore } from '@/store/modules/insights'

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
  computed: {
    indices() {
      return castArray(useInsightsStore().project)
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
