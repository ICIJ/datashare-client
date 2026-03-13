<script setup>
import ButtonToggleFileTypesGrouped from '@/components/Button/ButtonToggleFileTypesGrouped.vue'
import FilterType from './FilterType.vue'
import { ref } from 'vue'

defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const grouped = ref(false)
</script>

<template>
  <filter-type :filter="filter">
    <template #actions>
      <button-toggle-file-types-grouped v-model:grouped="grouped" />
    </template>
  </filter-type>
</template>
