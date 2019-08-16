<template>
  <div class="search-layout-selector btn-group">
    <button class="btn search-layout-selector__button" :class="{ 'search-layout-selector__button--active': layout === 'list' }" @click="layout = 'list'">
      <fa icon="th-list" />
    </button>
    <button class="btn search-layout-selector__button" :class="{ 'search-layout-selector__button--active': layout === 'grid' }" @click="layout = 'grid'">
      <fa icon="th" />
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
