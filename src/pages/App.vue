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

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { get } from 'lodash'

import AppSidebar from '@/components/AppSidebar/AppSidebar'
import Hook from '@/components/Hook'
import ScrollTracker from '@/components/ScrollTracker'
import { useCore } from '@/composables/core'

const { core } = useCore()

const signinUrl = computed(() => import.meta.env.VITE_DS_AUTH_SIGNIN)

// Function to handle HTTP errors
const handleHttpError = (err) => {
  const code = get(err, 'request.response.status') || get(err, 'response.status')
  if (code === 401) {
    const body = this.$t('login.logout')
    const linkLabel = this.$t('login.login')
    const href = signinUrl.value
    this.$toast.error(body, { href, linkLabel, autoClose: false })
  }
}

onMounted(() => {
  core.on('http::error', handleHttpError)
})

onBeforeUnmount(() => {
  core.off('http::error', handleHttpError)
})
</script>

<style lang="scss" scoped>
.app {
  --app-nav-height: #{$app-nav-height};
  --app-sidebar-width: #{$app-sidebar-width};

  min-height: 100vh;
}
</style>
