<template>
  <div>
    <div ref="appFooterVersion" class="version-number d-inline-block">
      <fa v-if="!noIcon" icon="bolt" class="mr-1"></fa>
      {{ label }} {{ serverVersion }}
    </div>
    <b-tooltip :target="() => $refs.appFooterVersion" :placement="tooltipPlacement">
      <div class="version-number__tooltip">
        <div class="d-flex text-left align-items-center version-number__tooltip__client">
          <div class="text-muted w-100">
            <fa icon="desktop"></fa>
            {{ $t('footer.clientVersion') }}
          </div>
          <div class="m-1 text-monospace version-number__tooltip__client__value">
            {{ clientHash }}
          </div>
        </div>
        <div class="d-flex text-left align-items-center version-number__tooltip__server">
          <div class="text-muted w-100">
            <fa icon="server"></fa>
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
/**
 * Display Datashare's version number.
 */
export default {
  name: 'VersionNumber',
  props: {
    /**
     * Placement of the tooltip with version info.
     * @values auto, top, bottom, left, right, topleft, topright, bottomleft, bottomright, lefttop, leftbottom, righttop, rightbottom
     */
    tooltipPlacement: {
      type: String,
      default: 'righttop'
    },
    /**
     * Hide the version icon (a lighting bolt)
     */
    noIcon: {
      type: Boolean
    },
    /**
     * Version prefix label
     */
    label: {
      type: String,
      default: 'Version'
    }
  },
  data() {
    return {
      serverHash: null,
      serverVersion: null
    }
  },
  computed: {
    clientHash() {
      return process.env.VUE_APP_GIT_HASH.substring(0, 7)
    }
  },
  mounted() {
    this.setVersion()
  },
  methods: {
    async fetchVersion() {
      return this.$core.api.getVersion()
    },
    async setVersion() {
      const version = await this.fetchVersion()
      this.$set(this, 'serverHash', version['git.commit.id.abbrev'])
      this.$set(this, 'serverVersion', version['git.build.version'])
    }
  }
}
</script>
