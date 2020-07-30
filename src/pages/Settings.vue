<template>
  <div>
    <page-header icon="cog" :title="$t('server.title')" :description="$t('server.description')"></page-header>
    <div class="container pt-4">
      <b-card no-body>
        <b-tabs pills card>
          <b-tab :title="$t('serverSettings.title')" active>
            <server-settings></server-settings>
          </b-tab>
          <b-tab :title="$t('plugins.title')" v-if="hasFeature('PLUGINS_AVAILABLE')">
            <b-card-text>
              <plugins></plugins>
            </b-card-text>
          </b-tab>
          <b-tab :title="$t('extensions.title')" v-if="hasFeature('EXTENSIONS_AVAILABLE')">
            <b-card-text>
              {{ $t('extensions.title') }}
            </b-card-text>
          </b-tab>
          <b-tab :title="$t('api.title')" v-if="hasFeature('API_AVAILABLE')">
            <b-card-text>
              {{ $t('api.title') }}
            </b-card-text>
          </b-tab>
        </b-tabs>
      </b-card>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/PageHeader'
import Plugins from '@/components/Plugins'
import ServerSettings from '@/components/ServerSettings'
import features from '@/mixins/features'

export default {
  name: 'Settings',
  components: {
    PageHeader,
    Plugins,
    ServerSettings
  },
  mixins: [features]
}
</script>
