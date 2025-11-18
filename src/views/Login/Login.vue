<script setup>
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import { whenever } from '@vueuse/core'
import { useRouter } from 'vue-router'

import LoginImage from '@/components/Login/LoginImage'
import I18nLocaleDropdown from '@/components/I18n/I18nLocaleDropdown'
import { useCore } from '@/composables/useCore'
import { useAuth } from '@/composables/useAuth'
import settings from '@/utils/settings'

const { t } = useI18n()
const core = useCore()
const { username } = useAuth()
const router = useRouter()

const image = useTemplateRef('image')
const signinUrl = import.meta.env.VITE_DS_AUTH_SIGNIN
const helpLink = core.vue.config.globalProperties.$config.get('helpLink', settings.helpLink)

// This ensures the login page can only be accessed by unauthenticated users
whenever(username, () => router.push({ name: 'landing' }))
</script>

<template>
  <div class="login d-flex flex-column justify-content-between align-items-stretch gap-2 p-4 vh-100">
    <div class="login__enter d-flex flex-column align-items-center text-action-emphasis p-4">
      <login-image
        ref="image"
        style="width: 240px"
      />
      <h3>{{ t('login.welcome') }}</h3>
      <p>{{ t('login.tagline') }}</p>
      <button-icon
        :label="t('login.account')"
        :href="signinUrl"
        class="login__enter_link mt-4"
        icon-left="user"
        variant="action"
        @click="image.shake()"
      />
    </div>
    <div class="login__assistance d-flex flex-column align-items-center justify-content-end gap-2">
      <button-icon
        class="login__assistance__help"
        :label="t('login.askHelp')"
        tag="a"
        :href="helpLink"
        variant="outline-secondary"
        @click="image.shake()"
      />
      <div class="login__assistance__locale d-flex align-items-center gap-2">
        {{ t('login.switchLanguage') }}
        <i18n-locale-dropdown class="px-2" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login {
  max-height: 630px;
}
</style>
