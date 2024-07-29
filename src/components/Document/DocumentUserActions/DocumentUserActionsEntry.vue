<template>
  <icon-button
    class="document-user-actions-entry bg-action-subtle text-action border-0"
    variant="outline-action"
    :icon-left="icon"
    :label="value"
    :tooltip-label="label"
    :aria-describedby="label"
  />
</template>
<script setup>
import IconButton from '@/components/IconButton'
defineOptions({ name: 'DocumentUserActionsEntry' })
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  icon: { type: String, required: true },
  first: { type: Boolean }
})
</script>

<style lang="scss" scoped></style>
