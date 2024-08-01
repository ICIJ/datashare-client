<script setup>
import DocumentUserCommentsList from '@/components/Document/DocumentUserActions/DocumentUserComments/DocumentUserCommentsList'
import DocumentUserCommentsAction from '@/components/Document/DocumentUserActions/DocumentUserComments/DocumentUserCommentsAction'
import DocumentUserActionsCard from '@/components/Document/DocumentUserActions/DocumentUserActionsCard.vue'
const comment = defineModel({
  type: String,
  required: true
})
const props = defineProps({
  comments: { type: Array, default: () => [] }
})

const title = `${props.comments.length} comments`
</script>

<template>
  <document-user-actions-card icon="chats-teardrop" :title="title" :show-warning="true">
    <template #content>
      <document-user-comments-list :comments="comments" />
    </template>
    <template #footer-warning
      >Your comments are public to project’s members and are also be visible on the iHub
    </template>
    <template #footer>
      <document-user-comments-action :model-value="comment" @update:model-value="$emit('update:modelValue', $event)" />
    </template>
  </document-user-actions-card>
</template>

<style scoped lang="scss"></style>
