<template>
  <b-form class="batch-search-copy-form" @submit.prevent="copyBatchSearch">
    <div class="card w-100">
      <div class="card-body pb-1">
        <b-form-group label-size="sm" :label="`${$t('batchSearch.name')} *`">
          <b-form-input v-model="name" type="text" required class="batch-search-copy-form__input__name" />
        </b-form-group>
        <b-form-group label-size="sm" :label="$t('batchSearch.description')">
          <b-form-textarea
            v-model="description"
            rows="2"
            max-rows="6"
            class="batch-search-copy-form__input__description"
          />
        </b-form-group>
        <b-form-group label-size="sm">
          <b-form-checkbox v-model="deleteAfterRelaunch" switch class="batch-search-copy-form__input__delete">
            {{ $t('batchSearchResults.deleteAfterRelaunch') }}
          </b-form-checkbox>
        </b-form-group>
      </div>
      <div class="card-footer">
        <div class="d-flex justify-content-end align-items-center">
          <b-button type="submit" variant="primary" class="batch-search-copy-form__submit">
            {{ $t('global.submit') }}
          </b-button>
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
  name: 'BatchSearchCopyForm',
  props: {
    /**
     * The batch search meta data
     */
    batchSearch: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      deleteAfterRelaunch: false,
      description: this.batchSearch.description,
      name: this.batchSearch.name
    }
  },
  methods: {
    async copyBatchSearch() {
      try {
        const { uuid: batchId } = this.batchSearch
        await this.$core.api.copyBatchSearch(batchId, this.name, this.description)
        this.$toast.success(this.$t('batchSearch.submitSuccess'))
        if (this.deleteAfterRelaunch) {
          await this.$store.dispatch('batchSearch/deleteBatchSearch', { batchId })
        }
        this.$router.push({ name: 'task.batch-search.list' })
      } catch (_) {
        this.$toast.error(this.$t('batchSearch.submitError'))
      }
    }
  }
}
</script>
