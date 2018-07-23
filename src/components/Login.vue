<template>
  <div class="login">
    <div class="login__card card text-center">
      <div class="login__card__heading card-title mt-4">
        <h2 class="display-4">Welcome to Datashare</h2>
        <p class="lead mb-0">
          <a hre="https://icij.org">ICIJ</a>' search and discovery platform.
        </p>
      </div>
      <div class="login__card__body">
        <ul class="list-group">
          <li class="list-group-item bg-light">
            <p>To log in, use ICIJ secure authentication plateform:</p>
            <a class="btn btn-dark btn-lg" :href="getConfig('ds_auth_signin')">
              <font-awesome-icon icon="user-shield" class="mr-2" />
              Login with Xemx
            </a>
          </li>
          <li class="list-group-item">
            <p>If you need any help, please visit our support desk:</p>
            <a class="btn btn-outline-secondary btn-lg" href="https://jira.icij.org/servicedesk/">
              <font-awesome-icon icon="ambulance" class="mr-2" />
              Ask for help
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
      return get(process.env.CONFIG, name, defaultValue)
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
