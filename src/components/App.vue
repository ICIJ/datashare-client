<template>
  <div class="app">
    <app-nav />
    <router-view />
  </div>
</template>

<style lang="scss">
  .app {
    margin-top: $app-nav-height;
  }
</style>

<script>
import AppNav from './AppNav'

export default {
  name: 'App',
  components: { AppNav }
}
</script>
