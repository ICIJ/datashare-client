<script setup>
const props = defineProps({
  uuid: { type: String, required: true },
  indices: { type: String, required: true },
  query: { type: String, required: true }
})
const to = {
  name: 'task.batch-search-queries-results.list',
  params: { uuid: props.uuid, indices: props.indices, query: props.query }
}
</script>
<template>
  <router-link :to="to"><slot /></router-link>
</template>
