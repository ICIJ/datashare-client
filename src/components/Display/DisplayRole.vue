<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { usePolicies } from '@/composables/usePolicies.js'
const props = defineProps({
  value: {
    type: String
  },
  noIcon: {
    type: Boolean,
    default: false
  }
})
const { formatRole } = usePolicies()
const role = computed(() => formatRole(props.value))
</script>

<template>
  <span class="d-inline-flex gap-1">
    <phosphor-icon
      v-if="!noIcon"
      :name="PhUserSquare"
    />{{ role }}</span>
</template>
