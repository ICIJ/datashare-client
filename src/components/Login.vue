<template>
  <div class="login">
    <div class="container">
      <div class="text-center">
        <h1 class="display-4">Welcome to Datashare</h1>
        <p class="lead">
          The International Consortium of Investigative Journalists' search and discovery platform.
        </p>
        <p>
          <a class="btn btn-primary btn-lg" :href="getConfig('ds_auth_signin')">
            <i class="fa fa-sign-in"></i>&nbsp;
            Login with Xemx
          </a></p>
        <p class="lead">
          If you need any help, please visit our support web portal.
        </p>
        <p>
          <a class="btn btn-secondary btn-lg" href="https://jira.icij.org/servicedesk/">
            <i class="fa fa-ambulance"></i>&nbsp;
            Ask for help
          </a>
        </p>
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
