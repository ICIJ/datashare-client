<template>
  <div class="login">
    <div class="login__card card text-center">
      <div class="login__card__heading card-title mt-4">
        <h2 class="display-4">{{ $t('login.welcome') }}</h2>
        <p class="lead mb-0">
          {{ $t('login.sum_up') }}
        </p>
      </div>
      <div class="login__card__body">
        <ul class="list-group">
          <li class="list-group-item bg-light">
            <p>{{ $t('login.authentication_platform') }}</p>
            <a class="btn btn-dark btn-lg" :href="getConfig('DS_AUTH_SIGNIN')">
              <font-awesome-icon icon="user-shield" class="mr-2" />
              {{ $t('login.xemx') }}
            </a>
          </li>
          <li class="list-group-item">
            <p>{{ $t('login.support_desk') }}</p>
            <a class="btn btn-outline-secondary btn-lg" href="https://jira.icij.org/servicedesk/customer/portal/4/create/108">
              <font-awesome-icon icon="ambulance" class="mr-2" />
              {{ $t('login.ask_help') }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get'

export default {
  name: 'Login',
  methods: {
    getConfig (name, defaultValue) {
      return get(process.env, `VUE_APP_${name.toUpperCase()}`, defaultValue)
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
