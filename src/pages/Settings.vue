<template>
  <div>
    <page-header icon="cog" :title="$t('server.title')" :description="$t('server.description')"></page-header>
    <div class="container pt-4">
      <b-card no-body>
        <b-tabs pills card>
          <b-tab :title="$t('serverSettings.title')" active v-if="!$config.is('multipleProjects')">
            <server-settings></server-settings>
          </b-tab>
          <b-tab :title="$t('plugins.title')" v-if="!$config.is('multipleProjects') && hasFeature('PLUGINS_AVAILABLE')">
            <b-card-text>
              <plugins></plugins>
            </b-card-text>
          </b-tab>
          <b-tab :title="$t('extensions.title')" v-if="!$config.is('multipleProjects') && hasFeature('EXTENSIONS_AVAILABLE')">
            <b-card-text>
              <extensions></extensions>
            </b-card-text>
          </b-tab>
          <b-tab :title="$t('api.title')" v-if="!!$config.is('multipleProjects') && hasFeature('API_AVAILABLE')">
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
import features from '@/mixins/features'

export default {
  name: 'Settings',
  components: {
    Api,
    Extensions,
    PageHeader,
    Plugins,
    ServerSettings
  },
  mixins: [features]
}
</script>
