<template>
  <div class="app">
    <language-chooser/>
    <search/>
  </div>
</template>

<style lang="scss">
  .app {}
</style>

<script>
import LanguageChooser from './LanguageChooser'
import Search from './Search'

export default {
  components: {
    Search,
    LanguageChooser},
  name: 'App'
}
</script>
