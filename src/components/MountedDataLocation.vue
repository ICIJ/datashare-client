<template>
  <div class="mounted-data-location d-flex align-items-center px-1">
    <fa icon="folder" class="mx-1 text-muted mounted-data-location__icon" />
    <div class="flex-grow-1 text-monospace px-0 py-1 text-truncate mounted-data-location__value" :id="valueId">
      {{ $config.get('mountedDataDir') || $config.get('dataDir') }}
    </div>
    <b-popover :target="valueId" triggers="hover" placement="top" :boundary-padding="16 * 1.5">
      <template v-slot:title>{{ $t('footer.homedir') }}</template>
      <div class="text-monospace">
        {{ $config.get('mountedDataDir') || $config.get('dataDir') }}
      </div>
    </b-popover>
    <confirm-button class="btn btn-sm text-secondary mounted-data-location__delete-index" :confirmed="deleteAll" :title="$t('indexing.delete_index_label')" v-b-tooltip :label="$t('indexing.delete_index_label')" :description="$t('indexing.delete_index_description')">
      <fa icon="trash-alt" />
      <span class="sr-only">
        {{ $t('indexing.delete_index_label') }}
      </span>
    </confirm-button>
  </div>
</template>

<script>
import uniqueId from 'lodash/uniqueId'

export default {
  name: 'MountedDataLocation',
  methods: {
    async deleteAll () {
      await this.$store.dispatch('indexing/deleteAll')
      await this.$store.dispatch('batchSearch/deleteBatchSearches')
      this.$store.commit('userHistory/clear')
      this.$root.$emit('index::delete::all')
    }
  },
  computed: {
    valueId () {
      return uniqueId('mounted-data-location__value--')
    }
  }
}
</script>

<style lang="scss">
  .mounted-data-location {
    border-radius: 1em;
    background: rgba(black, 0.2);
  }
</style>
