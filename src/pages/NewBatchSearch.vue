<script>
import BatchSearchForm from '@/components/BatchSearchForm'

export default {
  name: 'NewBatchSearch',
  components: {
    BatchSearchForm
  },
  computed: {
    batchSearchRoute() {
      return { name: 'batch-search-list' }
    }
  },
  methods: {
    submit() {
      this.$router.push(this.batchSearchRoute)
    }
  }
}
</script>

<template>
  <div class="container py-4">
    <div class="mx-1 mb-2 d-flex">
      <router-link :to="batchSearchRoute">
        <fa icon="angle-left" class="mr-1" fixed-width />
        {{ $t('batchSearch.title') }}
      </router-link>
      <span class="border-left border-dark pl-3 ml-3 font-weight-bold">
        {{ $t('newBatchSearch.title') }}
      </span>
    </div>
    <batch-search-form hide-title @submit="submit"></batch-search-form>
  </div>
</template>
