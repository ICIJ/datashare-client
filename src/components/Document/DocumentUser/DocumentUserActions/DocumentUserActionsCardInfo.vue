<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import { ICON_WEIGHTS } from '@/enums/iconWeights'

defineOptions({ name: 'DocumentUserActionsCardInfo' })

defineProps({
  icon: {
    type: [String, Array, Object],
    default: 'info'
  },
  iconWeight: {
    type: String,
    default: ICON_WEIGHTS.REGULAR
  }
})
</script>

<template>
  <p class="document-user-actions-card-info text-light-emphasis d-flex gap-1 align-items-start">
    <phosphor-icon :name="PhInfo" class="document-user-actions-card-info__icon" />
    <slot />
  </p>
</template>

<style scoped>
.document-user-actions-card-info__icon {
  margin-top: 0.125rem;
}
</style>
