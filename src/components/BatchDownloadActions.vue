<script>
import { get, castArray, compact, first, flow, keys, uniqueId } from 'lodash'
import { get as getFp, map as mapFp } from 'lodash/fp'
import Api from '@/api'

export default {
  name: 'BatchDownloadActions',
  props: {
    /**
     * Name of the batch download's task
     */
    name: {
      type: String
    },
    /**
     * State of the batch download's task
     */
    state: {
      type: String,
      default: ''
    },
    /**
     * Attributes of the batch download
     */
    value: {
      type: Object,
      default: () => ({ })
    }
  },
  computed: {
    api () {
      return new Api()
    },
    isTaskRunning () {
      return this.state.toUpperCase() === 'RUNNING'
    },
    popoverTarget () {
      return `#${this.togglerId}`
    },
    projects () {
      return this?.value?.projects?.map(p => p.name) || []
    },
    searchRoute () {
      const name = 'search'
      const query = {}
      const { bool: boolQuery = {} } = this.tryToParseQuery()
      // Create a function to retreive the query_string
      const queryStringPath = 'bool.should.0.query_string.query'
      const findQ = flow(castArray, mapFp(getFp(queryStringPath)), compact, first)
      // Create a closure function to apply the filter to the query object
      const applyFilter = (reverse = false) => {
        return filter => {
          keys(filter.terms || {}).forEach(name => {
            filter.terms[name].forEach(value => {
              const queryKey = reverse ? `f[-${name}]` : `f[${name}]`
              query[queryKey] ||= []
              query[queryKey].push(value)
            })
          })
        }
      }
      // Collect indices
      query.indices = this.projects.join(',')
      // Collect query string in "must"
      query.q = findQ(boolQuery.must || [])
      // Collect all filters and all reverse filter
      castArray(get(boolQuery, 'filter.bool.must', [])).forEach(applyFilter())
      castArray(get(boolQuery, 'filter.bool.must_not', [])).forEach(applyFilter(true))
      return { name, query }
    },
    togglerId () {
      return uniqueId('batch-download-actions-')
    }
  },
  methods: {
    closePopover () {
      this.$root.$emit('bv::hide::popover', this.togglerId)
    },
    async deleteTask () {
      try {
        this.closePopover()
        await this.api.deleteTask(this.name)
        this.notifyDeleteSucceed()
      } catch (error) {
        this.notifyDeleteFailed(error)
      }
    },
    async relaunchTask () {
      try {
        this.closePopover()
        const projectIds = this.projects
        const query = this.parseQuery()
        await this.api.runBatchDownload({ projectIds, query })
        this.notifyRelaunchSucceed()
      } catch (error) {
        this.notifyRelaunchFailed(error)
      }
    },
    notifyRelaunchSucceed () {
      const title = this.$t('batchDownload.relaunch.succeed')
      const variant = 'success'
      const body = this.$t('batchDownload.relaunch.succeedBody')
      this.$root.$bvToast.toast(body, { variant, title })
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
      const body = this.$t('batchDownload.relaunch.failedBody')
      this.$root.$bvToast.toast(body, { variant, title })
      /**
       * The batch download couldn't be relaunched
       *
       * @event relaunchFailed
       */
      this.$emit('relaunchFailed', error)
    },
    notifyDeleteSucceed () {
      /**
       * The batch download was deleted successfully
       *
       * @event deleted
       */
      this.$emit('deleted', this.value)
    },
    notifyDeleteFailed (error) {
      const title = this.$t('batchDownload.delete.failed')
      const variant = 'danger'
      const body = this.$t('batchDownload.delete.failedBody')
      this.$root.$bvToast.toast(body, { variant, title })
      /**
       * The batch download couldn't be deleted
       *
       * @event deleteFailed
       */
      this.$emit('deleteFailed', error)
    },
    parseQuery () {
      return JSON.parse(this.value.query || null) ?? {}
    },
    tryToParseQuery () {
      try {
        return this.parseQuery()
      } catch (_) {
        return {}
      }
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
      <b-dropdown-item-button @click="relaunchTask()" class="batch-download-actions__relaunch">
        <fa icon="redo" fixed-width class="mr-1" />
        {{ $t('batchDownloadActions.relaunch') }}
      </b-dropdown-item-button>
      <b-dropdown-item :to="searchRoute" class="batch-download-actions__search">
        <fa icon="search" fixed-width class="mr-1" />
        {{ $t('batchDownloadActions.search') }}
      </b-dropdown-item>
      <b-dropdown-divider />
      <b-dropdown-item-button v-if="isTaskRunning" disabled button-class="batch-download-actions__delete">
        <fa icon="trash-alt" fixed-width class="mr-1" />
        {{ $t('batchDownloadActions.delete') }}
      </b-dropdown-item-button>
      <b-dropdown-item-button v-else button-class="batch-download-actions__delete text-danger" @click="deleteTask">
        <fa icon="trash-alt" fixed-width class="mr-1" />
        {{ $t('batchDownloadActions.delete') }}
      </b-dropdown-item-button>
    </b-popover>
  </div>
</template>
