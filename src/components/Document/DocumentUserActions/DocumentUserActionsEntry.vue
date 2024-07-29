<template>
  <icon-button
    class="document-user-actions-entry text-action border-0 d-flex flex-grow-0 justify-content-center"
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

<style lang="scss" scoped>
.document-user-actions-entry {
  background: var(--bs-btn-action-bg);
  &:hover {
    background: var(--bs-btn-hover-bg);
    color: var(--bs-btn-hover-color) !important;
  }
}
</style>
