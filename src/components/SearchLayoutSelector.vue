<template>
  <div class="search-layout-selector btn-group">
    <button class="btn search-layout-selector__button" :class="{ 'search-layout-selector__button--active': layout === 'list' }" @click="layout = 'list'" title="View in list" v-b-tooltip>
      <fa icon="th-list" fa-fw />
      <span class="sr-only">View in list</span>
    </button>
    <button class="btn search-layout-selector__button" :class="{ 'search-layout-selector__button--active': layout === 'grid' }" @click="layout = 'grid'" title="View in grid" v-b-tooltip>
      <fa icon="th" fa-fw />
      <span class="sr-only">View in grid</span>
    </button>
    <button class="btn search-layout-selector__button" :class="{ 'search-layout-selector__button--active': layout === 'table' }" @click="layout = 'table'" title="View in table" v-b-tooltip>
      <fa icon="table" fa-fw />
      <span class="sr-only">View in table</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'SearchLayoutSelector',
  computed: {
    layout: {
      get () {
        return this.$store.state.search.layout
      },
      set (layout) {
        return this.$store.commit('search/layout', layout)
      }
    }
  }
}
</script>

<style lang="scss">
  .search-layout-selector {

    &__button.btn {
      background: white;
    }

    &__button--active.btn {
      color: $component-active-color;
      background: $tertiary;
    }
  }
</style>
