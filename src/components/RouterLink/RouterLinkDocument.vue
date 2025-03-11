<script setup>
import { computed } from 'vue'
import { basename } from 'path'

const props = defineProps({
  value: {
    type: [Object]
  }
})

const project = computed(() => props.value.project.name ?? props.value.project)

const to = computed(() => ({
  name: 'document',
  params: {
    index: project.value,
    id: props.value.documentId,
    routing: props.value.rootId
  }
}))

const display = computed(() => basename(props.value.documentPath))
</script>

<template>
  <router-link :to="to" class="text-nowrap">
    {{ display }}
  </router-link>
</template>
