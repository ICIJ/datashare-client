<template>
  <div>
    <div :id="versionNumberId" class="version-number d-inline-block">
      <fa v-if="!noIcon" icon="bolt" class="me-1"></fa>
      {{ label }} {{ serverVersion }}
    </div>
    <b-tooltip :target="versionNumberId" :placement="tooltipPlacement">
      <div class="version-number__tooltip">
        <div class="d-flex text-left align-items-center version-number__tooltip__client">
          <div class="text-muted w-100">
            <fa icon="desktop"></fa>
            {{ $t('footer.clientVersion') }}
          </div>
          <div class="m-1 text-monospace version-number__tooltip__client__value">
            {{ shortClientHash }}
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
import { uniqueId } from 'lodash'

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
      return import.meta.env.VITE_GIT_HASH ?? ''
    },
    shortClientHash() {
      return this.clientHash.substring(0, 7)
    },
    versionNumberId() {
      return uniqueId('version-number-')
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
      this.serverHash = version['git.commit.id.abbrev']
      this.serverVersion = version['git.build.version']
    }
  }
}
</script>
