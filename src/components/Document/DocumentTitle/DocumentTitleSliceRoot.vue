<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'DocumentTitleSliceRoot'
})

const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  slice: {
    type: String,
    required: true
  }
})

const params = computed(() => {
  const id = props.document.source.rootDocument || props.document.id
  const index = props.document.index
  return { id, index }
})
</script>

<template>
  <router-link class="document-title-slice-root" :to="{ name: 'document', params }">
    {{ document.root?.subject || slice }}
  </router-link>
</template>
