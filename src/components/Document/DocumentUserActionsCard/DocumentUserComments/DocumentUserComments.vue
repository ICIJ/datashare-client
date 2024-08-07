<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentUserCommentsList from '@/components/Document/DocumentUserActionsCard/DocumentUserComments/DocumentUserCommentsList'
import DocumentUserCommentsAction from '@/components/Document/DocumentUserActionsCard/DocumentUserComments/DocumentUserCommentsAction'
import DocumentUserActionsCard from '@/components/Document/DocumentUserActionsCard/DocumentUserActionsCard'

defineOptions({ name: 'DocumentUserComments' })
const comments = defineModel({
  type: Array,
  default: () => []
})
const props = defineProps({
  comment: { type: String, default: '' },
  to: { type: String, default: '' },
  username: { type: String, default: '' }
})

const { t } = useI18n()
const title = computed(() => t('documentUserActions.comments', comments.value.length))
const warning = t('documentUserComments.warning')
const commentsIcon = 'chats-teardrop'

function addComment(comment) {
  // TODO CD retrieve real url here
  const newComment = { username: props.username, date: comment.date, to: props.to, text: comment.text }
  comments.value = [...comments.value, newComment]
}
</script>

<template>
  <document-user-actions-card :icon="commentsIcon" :title="title" show-warning action-end>
    <template #content>
      <document-user-comments-list :comments="comments" :to="to" />
    </template>
    <template #action-warning>{{ warning }}</template>
    <template #action>
      <document-user-comments-action :model-value="comment" :to="to" :username="username" @submit="addComment" />
    </template>
  </document-user-actions-card>
</template>

<style scoped lang="scss"></style>
