<template>
  <div>
    <page-header icon="cog" :title="$t('server.title')" :description="$t('server.description')"></page-header>
    <div class="container pt-4">
      <b-card no-body>
        <b-tabs card>
          <b-tab :title="$t('serverSettings.title')" active v-if="!isServer">
            <server-settings></server-settings>
          </b-tab>
          <b-tab :title="$t('plugins.title')" v-if="!isServer">
            <b-card-text>
              <plugins></plugins>
            </b-card-text>
          </b-tab>
          <b-tab :title="$t('extensions.title')" v-if="!isServer">
            <b-card-text>
              <extensions></extensions>
            </b-card-text>
          </b-tab>
          <b-tab :title="$t('api.title')" v-if="isServer">
            <b-card-text>
              <api></api>
            </b-card-text>
          </b-tab>
        </b-tabs>
      </b-card>
    </div>
  </div>
</template>

<script>
import Api from '@/components/Api'
import Extensions from '@/components/Extensions'
import PageHeader from '@/components/PageHeader'
import Plugins from '@/components/Plugins'
import ServerSettings from '@/components/ServerSettings'
import utils from '@/mixins/utils'

export default {
  name: 'Settings',
  mixins: [utils],
  components: {
    Api,
    Extensions,
    PageHeader,
    Plugins,
    ServerSettings
  }
}
</script>
