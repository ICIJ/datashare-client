<template>
  <div class="app" v-if="isAllowed">
    <app-nav />
    <router-view />
    <vue-progress-bar />
  </div>
  <div v-else>
    <div class="container">
      <div class="text-center">
        <h1>Welcome to Datashare</h1>
        <p class="lead">
          The International Consortium of Investigative Journalists' search and discovery platform.
        </p>
        <p>
          <a class="btn btn-primary btn-lg" :href="getConfig('ds_auth_url')">
            <i class="fa fa-sign-in"></i>&nbsp;
            Login with Xemx
          </a></p>
        <p class="lead">
          If you need any help, please visit our support web portal.
        </p>
        <p>
          <a class="btn btn-secondary btn-lg" href="https://jira.icij.org/servicedesk/">
            <i class="fa fa-ambulance"></i>&nbsp;
            Ask for help
          </a></p>
      </div>
    </div>
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
      // Byepass authorization in development
      if (process.env.NODE_ENV === 'development') return true
      // Read cookie to know if the request is authorized
      const getJSON = (key) => getCookie(key, JSON.parse)
      let cookie = getJSON(this.getConfig('ds_cookie_name'))
      return getCookie(this.getConfig('ds_cookie_name')) !== null && cookie.hasOwnProperty('login') && cookie.login !== null
    }
  },
  created () {
    if (process.env.NODE_ENV === 'production' && this.isAllowed) {
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
