<template>
  <div class="mounted-data-location d-flex align-items-center px-1">
    <fa icon="folder" class="mx-1 text-muted mounted-data-location__icon" />
    <span class="flex-grow-1 text-monospace p-0 text-truncate mounted-data-location__value" :title="$t('footer.homedir')" v-b-tooltip>
      {{ $config.get('mountedDataDir') || $config.get('dataDir') }}
    </span>
    <confirm-button class="btn btn-sm text-secondary mounted-data-location__delete-index" :confirmed="deleteAll" :title="$t('indexing.delete_index_label')" v-b-tooltip :label="$t('indexing.delete_index_label')" :description="$t('indexing.delete_index_description')">
      <fa icon="trash-alt" />
      <span class="sr-only">
        {{ $t('indexing.delete_index_label') }}
      </span>
    </confirm-button>
  </div>
</template>

<script>
export default {
  name: 'MountedDataLocation',
  methods: {
    async deleteAll () {
      await this.$store.dispatch('indexing/deleteAll')
      this.$store.commit('userHistory/clear')
      this.$root.$emit('index::delete::all')
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
