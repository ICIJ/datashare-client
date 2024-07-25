<template>
  <div class="mounted-data-location d-flex align-items-center px-1">
    <div class="d-flex align-items-center flex-grow-1 mw-100" @click="showTreeView()">
      <fa icon="folder" class="ms-1 me-2 mounted-data-location__icon"></fa>
      <div :id="valueId" class="flex-grow-1 font-monospace. px-0 py-1 text-truncate mounted-data-location__value">
        {{ dataDir }}
      </div>
    </div>
    <confirm-button
      class="btn btn-sm text-primary mounted-data-location__delete-index"
      :confirmed="deleteAll"
      :description="$t('indexing.deleteIndexDescription')"
      :label="$t('indexing.deleteIndexLabel')"
      :no="$t('global.no')"
      :yes="$t('global.yes')"
    >
      <fa icon="trash-can"></fa>
      <span class="sr-only">
        {{ $t('indexing.deleteIndexLabel') }}
      </span>
    </confirm-button>
    <b-popover :target="valueId" triggers="hover" placement="top" :boundary-padding="16 * 1.5">
      <template #title>
        {{ $t('footer.homedir') }}
      </template>
      <div class="font-monospace.">
        {{ dataDir }}
      </div>
    </b-popover>
    <b-modal ref="mounting-data-location-tree-view" lazy scrollable hide-header hide-footer body-class="p-0" size="lg">
      <tree-view v-model:path="path" :projects="projects" size count searchable></tree-view>
    </b-modal>
  </div>
</template>

<script>
import { uniqueId } from 'lodash'

import TreeView from '@/components/TreeView'

/**
 * Disk path to the data directory mounted by Datashare.
 */
export default {
  name: 'MountedDataLocation',
  components: {
    TreeView
  },
  data() {
    return {
      path: null
    }
  },
  computed: {
    valueId() {
      return uniqueId('mounted-data-location__value--')
    },
    dataDir() {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    projects() {
      return this.$core.projectIds
    }
  },
  methods: {
    async deleteAllProjects() {
      try {
        await this.$store.dispatch('indexing/deleteAll')
        this.$toast.success(this.$t('indexing.deleteSuccess'))
      } catch (error) {
        if (error && error.response && error.response.status !== 404) {
          this.$toast.error(this.$t('indexing.deleteFailure'))
        }
      }
    },
    async deleteAllBatchSearches() {
      try {
        await this.$store.dispatch('batchSearch/deleteBatchSearches')
        this.$toast.success(this.$t('indexing.deleteBatchSearchSuccess'))
      } catch (error) {
        if (error && error.response && error.response.status !== 404) {
          this.$toast.error(this.$t('indexing.deleteBatchSearchFailure'))
        }
      }
    },
    async deleteAll() {
      await this.deleteAllProjects()
      await this.deleteAllBatchSearches()
      await this.$core.createDefaultProject()
      await this.$core.loadUser()
      this.$store.commit('search/index', this.$config.get('defaultProject'))
      this.$core.emit('index::delete::all')
    },
    showTreeView() {
      this.path = this.dataDir
      this.$refs['mounting-data-location-tree-view'].show()
    }
  }
}
</script>

<style lang="scss" scoped>
.mounted-data-location {
  border-radius: 1em;
  background: rgba(black, 0.2);
  cursor: pointer;

  &:hover {
    background: rgba(black, 0.5);
    text-decoration: underline;
  }
}
</style>
