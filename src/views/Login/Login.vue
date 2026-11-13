<script setup>
import { computed } from 'vue'
import { whenever } from '@vueuse/core'
import { useRouter } from 'vue-router'

import LoginCard from '@/components/Login/LoginCard'
import LoginWelcome from '@/components/Login/LoginWelcome'
import { useAuth } from '@/composables/useAuth'

const { username, authMode } = useAuth()
const router = useRouter()

const isFormAuth = computed(() => authMode.value === 'form')

// This ensures the login page can only be accessed by unauthenticated users
whenever(username, () => router.push({ name: 'landing' }))
</script>

<template>
  <div
    class="login d-flex min-vh-100"
    :class="{ 'login--form-auth': isFormAuth }"
  >
    <login-card v-if="isFormAuth" />
    <login-welcome v-else />
  </div>
</template>

<style scoped lang="scss">
.login {
  &--form-auth {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
}
</style>
