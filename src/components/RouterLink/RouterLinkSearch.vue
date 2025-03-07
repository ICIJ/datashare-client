<script setup>
const props = defineProps({
  indices: { type: String, required: true },
  query: { type: String, required: true }
})
const query = { q: props.query, indices: props.indices }
const to = {
  name: 'search',
  query
}
</script>
<template>
  <router-link :to="to"><slot /></router-link>
</template>
