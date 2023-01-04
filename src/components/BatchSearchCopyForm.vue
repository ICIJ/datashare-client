<template>
  <b-form @submit.prevent="copyBatchSearch">
    <div class="card w-100">
      <div class="card-body pb-1">
        <b-form-group label-size="sm" :label="`${ $t('batchSearch.name') } *`">
          <b-form-input v-model="name" type="text" required />
        </b-form-group>
        <b-form-group label-size="sm" :label="$t('batchSearch.description')">
          <b-form-textarea v-model="description" rows="2" max-rows="6" />
        </b-form-group>
        <b-form-group label-size="sm">
          <b-form-checkbox v-model="deleteAfterRelaunch" switch>
            {{ $t('batchSearchResults.deleteAfterRelaunch') }}
          </b-form-checkbox>
        </b-form-group>
      </div>
      <div class="card-footer">
        <div class="d-flex justify-content-end align-items-center">
          <b-btn type="submit"  variant="primary">
            {{ $t('global.submit') }}
          </b-btn>
        </div>
      </div>
    </div>
  </b-form>
</template>

<script>

/**
 * A form to copy batch search
 */
export default {
  name: 'BatchSearchAction',
  props: {
    /**
     * The batch search meta data
     */
    batchSearch: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      deleteAfterRelaunch: false,
      description: this.batchSearch.description,
      name: this.batchSearch.name
    }
  },
  methods: {
    async runBatchSearch () {
      try {
        await this.$store.dispatch('indexing/runBatchSearch')
        this.$root.$bvToast.toast(this.$t('batchSearch.success'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$root.$bvToast.toast(this.$t('batchSearch.error'), { noCloseButton: true, variant: 'danger' })
      }
    },
    async copyBatchSearch () {
      try {
        const { uuid: batchId } = this.batchSearch
        await this.$core.api.copyBatchSearch(batchId, this.name, this.description)
        if (!this.isServer) {
          this.runBatchSearch()
        } else {
          this.$root.$bvToast.toast(this.$t('batchSearch.submitSuccess'), { noCloseButton: true, variant: 'success' })
        }
        if (this.deleteAfterRelaunch) {
          await this.$store.dispatch('batchSearch/deleteBatchSearch', { batchId })
        }
        this.$router.push({ name: 'batch-search' })
      } catch (_) {
        this.$root.$bvToast.toast(this.$t('batchSearch.submitError'), { noCloseButton: true, variant: 'danger' })
      }
    }
  }
}
</script>
