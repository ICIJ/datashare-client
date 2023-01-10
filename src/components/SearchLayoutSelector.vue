<template>
  <div class="search-layout-selector btn-group">
    <button
      v-b-tooltip
      class="btn search-layout-selector__button"
      :class="{ 'search-layout-selector__button--active': layout === 'list' }"
      :title="$t('search.layout.list')"
      @click="layout = 'list'"
    >
      <fa icon="th-list" fa-fw></fa>
      <span class="sr-only">
        {{ $t('search.layout.list') }}
      </span>
    </button>
    <button
      v-b-tooltip
      class="btn search-layout-selector__button"
      :class="{ 'search-layout-selector__button--active': layout === 'grid' }"
      :title="$t('search.layout.grid')"
      @click="layout = 'grid'"
    >
      <fa icon="th" fa-fw></fa>
      <span class="sr-only">
        {{ $t('search.layout.grid') }}
      </span>
    </button>
    <button
      v-b-tooltip
      class="btn search-layout-selector__button"
      :class="{ 'search-layout-selector__button--active': layout === 'table' }"
      :title="$t('search.layout.table')"
      @click="layout = 'table'"
    >
      <fa icon="table" fa-fw></fa>
      <span class="sr-only">
        {{ $t('search.layout.table') }}
      </span>
    </button>
  </div>
</template>

<script>
/**
 * Change the search results layout (grid, list or table).
 */
export default {
  name: 'SearchLayoutSelector',
  computed: {
    layout: {
      get() {
        return this.$store.state.search.layout
      },
      set(layout) {
        this.$root.$emit('bv::hide::tooltip')
        return this.$store.commit('search/layout', layout)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.search-layout-selector {
  &__button.btn {
    background: white;
  }

  &__button--active.btn {
    background: $tertiary;
    color: $component-active-color;
  }
}
</style>
