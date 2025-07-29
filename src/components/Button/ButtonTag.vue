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
  <search-parameter
    filter="tags"
    :value="label"
    :no-x-icon="noXIcon"
    @click:x="emit('delete', label)"
  />
</template>
