<template>
  <div class="login">
    <div class="login__card card text-center">
      <div class="login__card__heading card-title mt-4">
        <h2 class="display-4">{{ $t('login.welcome') }}</h2>
        <p class="lead mb-0" v-html="$t('login.sumUp')"></p>
      </div>
      <div class="login__card__body">
        <ul class="list-group">
          <li class="list-group-item bg-light">
            <p>{{ $t('login.authenticationPlatform') }}</p>
            <a class="btn btn-dark btn-lg" :href="signinUrl">
              <fa icon="user-shield" class="mr-2" />
              {{ $t('login.account') }}
            </a>
          </li>
          <li class="list-group-item">
            <p>{{ $t('login.supportDesk') }}</p>
            <a class="btn btn-outline-secondary btn-lg" :href="helpLink" target="_blank" :title="$t('login.askHelp')">
              <fa icon="ambulance" class="mr-2" />
              {{ $t('login.askHelp') }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import settings from '@/utils/settings'

export default {
  name: 'Login',
  computed: {
    signinUrl () {
      return process.env.VUE_APP_DS_AUTH_SIGNIN
    },
    helpLink () {
      return this.$config.get('helpLink', settings.helpLink)
    }
  },
  async mounted () {
    if (await this.$core.auth.getUsername()) {
      return this.$router.push('/')
    }
  }
}
</script>

<style lang="scss">
  .login {
    min-height: 100vh;
    padding: 10vh;
    background: theme-color('dark');

    &__card {
      max-width: 660px;
      margin:0 auto;

      &__heading h2 {
        font-size: 2.5rem;
      }
    }
  }
</style>
