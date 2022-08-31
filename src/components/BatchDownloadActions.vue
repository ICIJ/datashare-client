<script>
import { uniqueId } from 'lodash'
import Api from '@/api'

export default {
  name: 'BatchDownloadActions',
  props: {
    /**
       * Attributes of the batch download
       */
    value: {
      type: Object
    }
  },
  computed: {
    togglerId () {
      return uniqueId('batch-download-actions-')
    },
    popoverTarget () {
      return `#${this.togglerId}`
    },
    api () {
      return new Api()
    }
  },
  methods: {
    closePopover () {
      this.$root.$emit('bv::hide::popover', this.togglerId)
    },
    async relaunch () {
      try {
        this.closePopover()
        const projectIds = this.value.projects.map(p => p.name)
        const query = JSON.parse(this.value.query || null)
        await this.api.runBatchDownload({ projectIds, query })
        this.notifyRelaunchSucceed()
      } catch (error) {
        this.notifyRelaunchFailed(error)
      }
    },
    notifyRelaunchSucceed () {
      const title = this.$t('batchDownload.relaunch.succeed')
      const variant = 'success'
      this.$root.$bvToast.toast(this.$t('batchDownload.relaunch.succeedBody'), { variant, title })
      /**
         * The batch download was relaunched successfully
         *
         * @event relaunched
         */
      this.$emit('relaunched', this.value)
    },
    notifyRelaunchFailed (error) {
      const title = this.$t('batchDownload.relaunch.failed')
      const variant = 'danger'
      this.$root.$bvToast.toast(this.$t('batchDownload.relaunch.failedBody'), { variant, title })
      /**
         * The batch download couldn't be relaunched
         *
         * @event relaunchFailed
         */
      this.$emit('relaunchFailed', error)
    }
  }
}
</script>

<template>
  <div class="batch-download-actions">
    <b-btn variant="link" size="sm" class="p-1" :id="togglerId">
      <fa icon="ellipsis" fixed-width class="mx-1" />
    </b-btn>
    <b-popover
      boundary="viewport"
      custom-class="popover-body-p-0 popover-body-overflow-hidden dropdown-menu shadow popover-white"
      placement="left"
      triggers="focus"
      :target="popoverTarget">
      <b-dropdown-item-button @click="relaunch()">
        <fa icon="redo" fixed-width class="mr-1" />
        {{ $t('batchDownloadActions.relaunch') }}
      </b-dropdown-item-button>
    </b-popover>
  </div>
</template>
