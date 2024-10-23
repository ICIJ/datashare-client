<script setup>
import { computed } from 'vue'

const props = defineProps({
  document: {
    type: Object
  }
})

const to = computed(() => {
  return { name: 'document', params: props.document.routerParams }
})
</script>

<template>
  <td>
    <router-link :to="to" class="fw-medium">
      {{ document.title }}
    </router-link>
  </td>
</template>
