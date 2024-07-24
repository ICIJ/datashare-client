<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String
  },
  emphasis: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'page-table-th--emphasis': props.emphasis
  }
})
</script>

<template>
  <b-th class="page-table-th text-nowrap" :class="classList">
    <slot>
      <phosphor-icon v-if="icon" :name="icon" class="me-1" />
      {{ label }}
    </slot>
  </b-th>
</template>
