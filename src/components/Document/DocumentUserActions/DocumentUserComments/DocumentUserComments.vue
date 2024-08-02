<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentUserCommentsList from '@/components/Document/DocumentUserActions/DocumentUserComments/DocumentUserCommentsList'
import DocumentUserCommentsAction from '@/components/Document/DocumentUserActions/DocumentUserComments/DocumentUserCommentsAction'
import DocumentUserActionsCard from '@/components/Document/DocumentUserActions/DocumentUserActionsCard'

defineOptions({ name: 'DocumentUserComments' })
const comment = defineModel({
  type: String,
  required: true
})
const props = defineProps({
  comments: { type: Array, default: () => [] }
})

const { t } = useI18n()
const title = computed(() => t('documentUserActions.comments', props.comments.length))
const warning = t('documentUserComments.warning')
const commentsIcon = 'chats-teardrop'
</script>

<template>
  <document-user-actions-card :icon="commentsIcon" :title="title" show-warning>
    <template #content>
      <document-user-comments-list :comments="comments" />
    </template>
    <template #footer-warning>{{ warning }}</template>
    <template #footer>
      <document-user-comments-action :model-value="comment" @update:model-value="$emit('update:modelValue', $event)" />
    </template>
  </document-user-actions-card>
</template>

<style scoped lang="scss"></style>
