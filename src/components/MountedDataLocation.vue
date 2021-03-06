<template>
  <div class="mounted-data-location d-flex align-items-center px-1">
    <div class="d-flex align-items-center flex-grow-1 mw-100" @click="showTreeView()">
      <fa icon="folder" class="ml-1 mr-2 text-muted mounted-data-location__icon"></fa>
      <div class="flex-grow-1 text-monospace px-0 py-1 text-truncate mounted-data-location__value" :id="valueId">
        {{ dataDir }}
      </div>
    </div>
    <confirm-button
      class="btn btn-sm text-secondary mounted-data-location__delete-index"
      :confirmed="deleteAll"
      :description="$t('indexing.deleteIndexDescription')"
      :label="$t('indexing.deleteIndexLabel')"
      :no="$t('global.no')"
      :yes="$t('global.yes')">
      <fa icon="trash-alt"></fa>
      <span class="sr-only">
        {{ $t('indexing.deleteIndexLabel') }}
      </span>
    </confirm-button>
    <b-popover :target="valueId" triggers="hover" placement="top" :boundary-padding="16 * 1.5">
      <template v-slot:title>
        {{ $t('footer.homedir') }}
      </template>
      <div class="text-monospace">
        {{ dataDir }}
      </div>
    </b-popover>
    <b-modal id="mounting-data-location-tree-view" lazy scrollable hide-header hide-footer body-class="p-0" size="lg">
      <tree-view v-model="path" size count></tree-view>
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
  data () {
    return {
      path: null
    }
  },
  methods: {
    async deleteAll () {
      try {
        await this.$store.dispatch('indexing/deleteAll')
        await this.$store.dispatch('batchSearch/deleteBatchSearches')
        this.$root.$emit('index::delete::all')
        this.$bvToast.toast(this.$t('indexing.deleteSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('indexing.deleteFailure'), { noCloseButton: true, variant: 'danger' })
      }
    },
    showTreeView () {
      this.$set(this, 'path', this.dataDir)
      this.$bvModal.show('mounting-data-location-tree-view')
    }
  },
  computed: {
    valueId () {
      return uniqueId('mounted-data-location__value--')
    },
    dataDir () {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
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
