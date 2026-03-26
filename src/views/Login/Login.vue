<script setup>
import { computed } from 'vue'
import { whenever } from '@vueuse/core'
import { useRouter } from 'vue-router'

import LoginCard from '@/components/Login/LoginCard'
import LoginWelcome from '@/components/Login/LoginWelcome'
import { useCore } from '@/composables/useCore'
import { useAuth } from '@/composables/useAuth'

const FORM_AUTH_FILTER = 'org.icij.datashare.session.FormAuthFilter'

const core = useCore()
const { username } = useAuth()
const router = useRouter()

const isFormAuth = computed(() => core.config.get('authFilter') === FORM_AUTH_FILTER)

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
