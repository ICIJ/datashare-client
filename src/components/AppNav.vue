<template>
  <header class="app__nav">
    <div class="app__nav__container">
      <div class="app__nav__container__main py-3">
        <div class="app__nav__container__main__search-bar px-3 py-0">
          <search-bar class="p-0" settings />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import SearchBar from '@/components/SearchBar'

export default {
  name: 'AppNav',
  components: {
    SearchBar
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
      this.$root.$el.style.setProperty('--app-nav-height', height)
    }
  }
}
</script>

<style lang="scss">
  .app__nav {
    z-index: 15;
    position: relative;
    width: auto;
    color: $body-color;

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
