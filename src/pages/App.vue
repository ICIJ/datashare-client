<template>
  <div class="app d-flex">
    <hook name="app:before" />
    <app-sidebar />
    <div class="flex-grow-1">
      <router-view />
      <scroll-tracker />
    </div>
    <hook name="app:after" />
  </div>
</template>

<script>
import { get } from 'lodash'

import AppSidebar from '@/components/AppSidebar/AppSidebar'
import Hook from '@/components/Hook'
import ScrollTracker from '@/components/ScrollTracker'

export default {
  name: 'App',
  components: {
    AppSidebar,
    Hook,
    ScrollTracker
  },
  computed: {
    signinUrl() {
      return import.meta.env.VITE_DS_AUTH_SIGNIN
    }
  },
  created() {
    this.$core.on('http::error', this.handleHttpError)
  },
  beforeDestroy() {
    this.$core.off('http::error', this.handleHttpError)
  },
  methods: {
    handleHttpError(err) {
      const code = get(err, 'request.response.status') || get(err, 'response.status')
      if (code === 401) {
        const body = this.$t('login.logout')
        const linkLabel = this.$t('login.login')
        const href = this.signinUrl
        this.$toast.error(body, { href, linkLabel, autoClose: false })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app {
  --app-nav-height: #{$app-nav-height};
  --app-sidebar-width: #{$app-sidebar-width};

  min-height: 100vh;
}
</style>
