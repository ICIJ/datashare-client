<template>
  <div class="app" v-if="isAllowed">
    <app-nav />
    <router-view />
    <vue-progress-bar />
  </div>
  <div v-else>
    Log you in / Xemx thing <a :href="getConfig('ds_auth_url')">HERE</a>
  </div>
</template>

<style lang="scss">
  .app {
    margin-top: $app-nav-height;
  }
</style>

<script>
import AppNav from './AppNav'
import { DatashareClient } from '@/api/datashare'
import { getCookie } from 'tiny-cookie'

export default {
  name: 'App',
  components: { AppNav },
  computed: {
    isAllowed () {
      return getCookie(this.getConfig('ds_cookie_name')) !== null
    }
  },
  created () {
    if (process.env.NODE_ENV === 'production') {
      new DatashareClient().createIndex()
    }
  },
  methods: {
    getConfig (name) {
      return process.env.CONFIG[name]
    }
  }
}
</script>
