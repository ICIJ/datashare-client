<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur-next'

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
    <app-icon v-if="!noIcon">
      <i-ph-user-square />
    </app-icon>
    {{ role }}
  </span>
</template>
