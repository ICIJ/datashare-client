<script setup>
import DocumentUserActionsCardListTitle from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsCardListTitle'

defineOptions({ name: 'DocumentUserActionsCardList' })
defineProps({
  title: { type: String, default: null }
})
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <document-user-actions-card-list-title :title="title" />
    <div class="">
      <slot></slot>
    </div>
  </div>
</template>
