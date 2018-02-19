<template>
  <div class="app">
    <language-chooser></language-chooser>
    <div class="search">
      <input type="search" :placeholder="$t('search.placeholder')" name="search">
    </div>
  </div>
</template>

<style lang="scss">
  .app {}
</style>

<script>
import LanguageChooser from './LanguageChooser'

export default {
  components: {LanguageChooser},
  name: 'App'
}
</script>
