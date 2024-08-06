<script setup>
import DocumentUserActionsCardListTitle from '@/components/Document/DocumentUserActionsCard/DocumentUserActionsCardListTitle.vue'

defineOptions({ name: 'DocumentUserActionsCardList' })
defineProps({
  title: { type: String, default: null }
})
</script>

<template>
  <div class="py-2">
    <document-user-actions-card-list-title :title="title" />
    <div class="py-2">
      <slot></slot>
    </div>
  </div>
</template>
