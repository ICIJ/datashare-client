<template>
  <div class="login-view d-flex flex-column justify-content-between align-items-stretch gap-2 p-4 vh-100">
    <div class="login-view__enter d-flex flex-column align-items-center text-action-emphasis p-4">
      <login-image ref="image" style="width: 240px" />
      <h3>{{ welcomeLabel }}</h3>
      <p>{{ taglineLabel }}</p>

      <button-icon
        :label="loginLabel"
        :to="signinRoute"
        class="login-view__enter_link"
        icon-left="user"
        variant="action"
        @click="image.shake()"
      />
    </div>
    <div class="login-view__help d-flex flex-column align-items-center justify-content-end gap-2">
      <button-icon :label="askHelpLabel" tag="a" :href="helpLink" variant="outline-secondary" @click="image.shake()" />
      <div class="d-flex align-items-center gap-2">
        <span>{{ switchLanguageLabel }}</span
        ><locales-menu class="px-2" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import LoginImage from '@/components/Login/LoginImage'
import ButtonIcon from '@/components/Button/ButtonIcon'
import { useCore } from '@/composables/core'
import settings from '@/utils/settings'
import LocalesMenu from '@/components/LocalesMenu'
const image = ref(null)
const { t } = useI18n()
const loginLabel = computed(() => t('login.account'))
const welcomeLabel = computed(() => t('login.welcome'))
const askHelpLabel = computed(() => t('login.askHelp'))
const switchLanguageLabel = computed(() => t('login.switchLanguage'))
const taglineLabel = computed(() => t('login.tagline'))
const { core } = useCore()
const signinUrl = import.meta.env.VITE_DS_AUTH_SIGNIN
const signinRoute = computed(() => ({ path: signinUrl }))
const helpLink = core.vue.config.globalProperties.$config.get('helpLink', settings.helpLink)
</script>
<style scoped lang="scss">
.login-view {
  max-height: 630px;
}
</style>
