<template>
  <div>
    <div class="version-number" ref="appFooterVersion">
      <fa icon="bolt" class="mr-1" v-if="!noIcon" />
      {{ label }} {{ serverVersion }}
    </div>
    <b-tooltip :target="() => this.$refs.appFooterVersion" :placement="tooltipPlacement">
      <div class="version-number__tooltip">
        <div class="d-flex text-left align-items-center version-number__tooltip__client">
          <div class="text-muted w-100">
            <fa icon="desktop" />
            {{ $t('footer.clientVersion') }}
          </div>
          <div class="m-1 text-monospace version-number__tooltip__client__value">
            {{ clientHash }}
          </div>
        </div>
        <div class="d-flex text-left align-items-center version-number__tooltip__server">
          <div class="text-muted w-100">
            <fa icon="server" />
            {{ $t('footer.serverVersion') }}
          </div>
          <div class="m-1 text-monospace version-number__tooltip__server__value">
            {{ serverHash }}
          </div>
        </div>
      </div>
    </b-tooltip>
  </div>
</template>

<script>
import Api from '@/api'

export default {
  name: 'VersionNumber',
  props: {
    tooltipPlacement: {
      type: String,
      default: 'righttop'
    },
    noIcon: {
      type: Boolean
    },
    label: {
      type: String,
      default: 'Version'
    }
  },
  mounted () {
    this.setVersion()
  },
  data () {
    return {
      serverHash: null,
      serverVersion: null
    }
  },
  methods: {
    async fetchVersion () {
      const datashare = new Api()
      return datashare.getVersion()
    },
    async setVersion () {
      const version = await this.fetchVersion()
      this.serverHash = version['git.commit.id.abbrev']
      this.serverVersion = version['git.build.version']
    }
  },
  computed: {
    clientHash () {
      return process.env.VUE_APP_GIT_HASH.substring(0, 7)
    }
  }
}
</script>
