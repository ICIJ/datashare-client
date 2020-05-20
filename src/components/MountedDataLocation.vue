<template>
  <div class="mounted-data-location d-flex align-items-center px-1">
    <div class="d-flex align-items-center flex-grow-1 mw-100" @click="showTreeView()">
      <fa icon="folder" class="ml-1 mr-2 text-muted mounted-data-location__icon" />
      <div class="flex-grow-1 text-monospace px-0 py-1 text-truncate mounted-data-location__value" :id="valueId">
        {{ dataDir }}
      </div>
    </div>
    <confirm-button
      class="btn btn-sm text-secondary mounted-data-location__delete-index"
      :confirmed="deleteAll"
      :description="$t('indexing.deleteIndexDescription')"
      :label="$t('indexing.deleteIndexLabel')"
      :title="$t('indexing.deleteIndexLabel')"
      v-b-tooltip>
      <fa icon="trash-alt" />
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
      <tree-view v-model="selectedPath" />
    </b-modal>
  </div>
</template>

<script>
import uniqueId from 'lodash/uniqueId'
import TreeView from '@/components/TreeView'

export default {
  name: 'MountedDataLocation',
  components: {
    TreeView
  },
  data () {
    return {
      selectedPath: null
    }
  },
  methods: {
    async deleteAll () {
      try {
        await this.$store.dispatch('indexing/deleteAll')
        await this.$store.dispatch('batchSearch/deleteBatchSearches')
        this.$store.commit('userHistory/clear')
        this.$root.$emit('index::delete::all')
        this.$bvToast.toast(this.$t('indexing.deleteSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('indexing.deleteFailure'), { noCloseButton: true, variant: 'danger' })
      }
    },
    showTreeView () {
      this.selectedPath = this.dataDir
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
