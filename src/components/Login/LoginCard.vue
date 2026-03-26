<script setup>
import { shallowRef, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import LoginImage from '@/components/Login/LoginImage'
import LoginCardForm from '@/components/Login/LoginCardForm'
import LoginLocaleDropdownSelector from '@/components/Login/LoginLocaleDropdownSelector'
import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'
import settings from '@/utils/settings'

const { t } = useI18n()
const core = useCore()
const { waitFor, isLoading } = useWait()

const image = useTemplateRef('image')
const helpLink = core.config.get('helpLink', settings.helpLink)
const error = shallowRef(false)

const handleSubmit = waitFor(async ({ username: user, password }) => {
  error.value = false
  try {
    await core.api.login(user, password)
    // Full page reload to re-run the boot sequence with the new session
    window.location.replace('/')
  }
  catch {
    error.value = true
    image.value?.shake()
  }
})
</script>

<template>
  <div class="login-card d-flex flex-column flex-md-row rounded overflow-hidden">
    <div class="login-card__illustration d-flex align-items-center justify-content-center p-3 p-md-5">
      <login-image
        ref="image"
        class="login-card__illustration__image"
      />
    </div>
    <div class="login-card__panel d-flex flex-column justify-content-center p-4 p-md-5">
      <h3 class="login-card__panel__welcome mb-1">
        {{ t('login.welcome') }}
      </h3>
      <p class="login-card__panel__tagline text-secondary-emphasis">
        {{ t('login.tagline') }}
      </p>
      <login-card-form
        class="login-card__panel__form mt-4"
        :error="error"
        :disabled="isLoading"
        @submit="handleSubmit"
      >
        <template #actions>
          <button-icon
            class="login-card__panel__help"
            :label="t('login.askHelp')"
            tag="a"
            :href="helpLink"
            variant="outline-secondary"
          />
        </template>
      </login-card-form>
    </div>
  </div>
  <login-locale-dropdown-selector class="mt-3" />
</template>

<style scoped lang="scss">
.login-card {
  border: var(--bs-border-width) solid var(--bs-border-color);
  max-width: 960px;
  width: 100%;
  background: var(--bs-body-bg);
  box-shadow: var(--bs-box-shadow);

  &__illustration {
    flex: 1;
    background: var(--bs-tertiary-bg);

    &__image {
      width: 140px;

      @media (min-width: 768px) {
        width: 240px;
      }
    }
  }

  &__panel {
    flex: 1;

    @media (min-width: 768px) {
      &__form {
        max-width: 400px;
      }
    }
  }
}

@include color-mode(dark) {
  .login-card {
    &__illustration {
      background: var(--bs-secondary-bg);
    }
  }
}
</style>
