<template>
  <div>
    <page-header icon="cog" :title="$t('server.title')" :description="$t('server.description')">
      <template #tabs>
        <b-tab v-if="!isServer" :title="$t('serverSettings.title')" active>
          <server-settings class="card container mt-4" />
        </b-tab>
        <b-tab v-if="!isServer" :title="$t('plugins.title')">
          <b-card-text>
            <plugins />
          </b-card-text>
        </b-tab>
        <b-tab v-if="!isServer" :title="$t('extensions.title')">
          <b-card-text>
            <extensions />
          </b-card-text>
        </b-tab>
        <b-tab v-if="isServer" :title="$t('api.title')">
          <b-card-text>
            <api />
          </b-card-text>
        </b-tab>
      </template>
    </page-header>
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
  components: {
    Api,
    Extensions,
    PageHeader,
    Plugins,
    ServerSettings
  },
  mixins: [utils]
}
</script>
