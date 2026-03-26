<script setup>
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import IPhUser from '~icons/ph/user'

import LoginImage from '@/components/Login/LoginImage'
import LoginLocaleDropdownSelector from '@/components/Login/LoginLocaleDropdownSelector'
import { useCore } from '@/composables/useCore'
import settings from '@/utils/settings'

const { t } = useI18n()
const core = useCore()

const image = useTemplateRef('image')
const signinUrl = import.meta.env.VITE_DS_AUTH_SIGNIN
const helpLink = core.config.get('helpLink', settings.helpLink)

function shakeImage() {
  image.value?.shake()
}
</script>

<template>
  <div class="login-welcome d-flex flex-column justify-content-between align-items-stretch gap-2 p-4 w-100">
    <div class="login-welcome__enter d-flex flex-column align-items-center text-action-emphasis p-4">
      <login-image
        ref="image"
        style="width: 240px"
      />
      <h3>{{ t('login.welcome') }}</h3>
      <p>{{ t('login.tagline') }}</p>
      <button-icon
        :label="t('login.account')"
        :href="signinUrl"
        class="login-welcome__enter__link mt-4"
        :icon-left="IPhUser"
        variant="action"
        @click="shakeImage"
      />
    </div>
    <div class="login-welcome__assistance d-flex flex-column align-items-center justify-content-end gap-2">
      <button-icon
        class="login-welcome__assistance__help"
        :label="t('login.askHelp')"
        tag="a"
        :href="helpLink"
        variant="outline-secondary"
        @click="shakeImage"
      />
      <login-locale-dropdown-selector />
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-welcome {
  max-height: 630px;
}
</style>
