<script>
import BatchSearchForm from '@/components/BatchSearchForm'

export default {
  name: 'TaskBatchSearchNew',
  components: {
    BatchSearchForm
  },
  computed: {
    batchSearchRoute() {
      return { name: 'task.batch-search.list' }
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
        <fa icon="angle-left" class="me-1" fixed-width />
        {{ $t('batchSearch.title') }}
      </router-link>
    </div>
    <batch-search-form @submit="submit"></batch-search-form>
  </div>
</template>
