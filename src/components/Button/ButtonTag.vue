<script setup>
import SearchParameter from '@/components/Search/SearchParameter/SearchParameter'

defineOptions({ name: 'ButtonTag' })

defineProps({
  label: {
    type: [Array, String]
  },
  noXIcon: {
    type: Boolean
  }
})

const emit = defineEmits(['delete'])
</script>

<template>
  <search-parameter :icon="PhHash" filter="tag" :term="label" :no-x-icon="noXIcon" @click:x="emit('delete', label)" />
</template>
