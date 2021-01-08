<template>
  <header class="app__nav">
    <hook name="search.nav:before"></hook>
    <div class="app__nav__container">
      <div class="app__nav__container__main py-3 d-flex align-items-center">
        <div class="app__nav__container__main__search-bar px-3 py-0 flex-grow-1">
          <search-bar class="p-0" settings animated></search-bar>
        </div>
        <search-layout-selector class="ml-auto px-3"></search-layout-selector>
      </div>
    </div>
    <hook name="search.nav:after"></hook>
  </header>
</template>

<script>
import Hook from '@/components/Hook'
import SearchBar from '@/components/SearchBar'
import SearchLayoutSelector from '@/components/SearchLayoutSelector'

/**
 * The global app navigation bar.
 */
export default {
  name: 'AppNav',
  components: {
    Hook,
    SearchBar,
    SearchLayoutSelector
  },
  mounted () {
    this.saveComponentHeight()
  },
  updated () {
    this.saveComponentHeight()
  },
  methods: {
    saveComponentHeight () {
      const height = `${this.$el.offsetHeight}px`
      // Save component height in a CSS variable after it's been update
      this.$root.$el.style.setProperty('--core-nav-height', height)
    }
  }
}
</script>

<style lang="scss" scoped>
  .app__nav {
    color: $body-color;
    position: relative;
    width: auto;
    z-index: 25;

    @media (max-width: $document-float-breakpoint-width) {
      z-index: 15;
    }

    .search--grid &, .search--table & {
      z-index: 15;
    }

    &__container {

      &__main {
        border-radius: $border-radius-lg 0 0 0;
        position:relative;
        white-space: nowrap;
        z-index: $zindex-fixed + 30;

        &__search-bar {
          max-width: 880px;
          padding: 0;
          position: relative;
        }
      }
    }
  }
</style>
