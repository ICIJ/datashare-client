<script setup>
import DocumentUserActionsCardListTitle from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsCardListTitle'

defineOptions({ name: 'DocumentUserActionsCardList' })

defineProps({
  title: {
    type: String,
    default: null
  },
  bodyClass: {
    type: [String, Array, Object]
  }
})
</script>

<template>
  <div class="document-user-actions-card-list">
    <document-user-actions-card-list-title v-if="title" :title="title" />
    <div class="document-user-actions-card-list__body" :class="bodyClass">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-user-actions-card-list {
  display: flex;
  flex-direction: column;
  gap: $spacer;

  &:has(.document-user-actions-card-list__body:empty) {
    display: none;
  }
}
</style>
