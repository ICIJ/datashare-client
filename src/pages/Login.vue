<template>
  <div class="login">
    <div class="login__card card text-center">
      <div class="login__card__heading card-title mt-4">
        <h2 class="display-4">{{ $t('login.welcome') }}</h2>
        <p class="lead mb-0" v-html="$t('login.sumUp')"></p>
      </div>
      <div class="login__card__body">
        <ul class="list-group">
          <li class="list-group-item bg-light py-3">
            <p>
              {{ $t('login.authenticationPlatform') }}
            </p>
            <a class="btn btn-primary btn-lg" :href="signinUrl">
              <fa icon="user-shield" class="me-2"></fa>
              {{ $t('login.account') }}
            </a>
          </li>
          <li class="list-group-item py-3">
            <p>{{ $t('login.supportDesk') }}</p>
            <a class="btn btn-outline-secondary btn-lg" :href="helpLink" target="_blank" :title="$t('login.askHelp')">
              <fa icon="truck-medical" class="me-2"></fa>
              {{ $t('login.askHelp') }}
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="login__footer d-flex">
      <locales-menu v-slot="{ currentLocale }" class="ms-auto" popover-placement="bottom">
        <fa icon="globe" fixed-width />
        {{ currentLocale.label }}
      </locales-menu>
    </div>
  </div>
</template>

<script>
import settings from '@/utils/settings'

export default {
  name: 'Login',
  computed: {
    signinUrl() {
      return import.meta.env.VITE_DS_AUTH_SIGNIN
    },
    helpLink() {
      return this.$config.get('helpLink', settings.helpLink)
    }
  },
  async mounted() {
    if (await this.$core.auth.getUsername()) {
      return this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.login {
  background: darken($primary, 10%);
  min-height: 100vh;
  padding: 10vh;

  &__card {
    margin: 0 auto;
    max-width: 660px;

    &__heading h2 {
      font-size: 2.5rem;
    }
  }

  &__footer {
    margin: 0 auto;
    color: #fff;
    max-width: 660px;
  }
}
</style>
