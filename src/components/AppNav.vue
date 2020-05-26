<template>
  <header class="app__nav">
    <hook name="search.nav:before" />
    <div class="app__nav__container">
      <div class="app__nav__container__main py-3 d-flex align-items-center">
        <div class="app__nav__container__main__search-bar px-3 py-0 flex-grow-1">
          <search-bar class="p-0" settings animated />
        </div>
        <search-layout-selector class="ml-auto px-3" />
      </div>
    </div>
    <hook name="search.nav:after" />
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

<style lang="scss">
  .app__nav {
    z-index: 25;
    position: relative;
    width: auto;
    color: $body-color;

    @media (max-width: $document-float-breakpoint-width) {
      z-index: 15;
    }

    .search--grid &, .search--table & {
      z-index: 15;
    }

    &__container {

      &__main {
        position:relative;
        z-index: $zindex-fixed + 30;
        border-radius: $border-radius-lg 0 0 0;
        white-space: nowrap;

        &__search-bar {
          position: relative;
          padding: 0;
          max-width: 880px;
        }
      }
    }
  }
</style>
