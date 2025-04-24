<script setup>
import { noop } from 'lodash'

import DocumentUserCommentsHeader from '@/components/Document/DocumentUser/DocumentUserComments/DocumentUserCommentsHeader'
import DocumentUserCommentsList from '@/components/Document/DocumentUser/DocumentUserComments/DocumentUserCommentsList'
import DocumentUserCommentsForm from '@/components/Document/DocumentUser/DocumentUserComments/DocumentUserCommentsForm'
import DocumentUserActionsCard from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsCard'

defineOptions({ name: 'DocumentUserComments' })

const visible = defineModel('visible', {
  type: Boolean,
  default: true
})

defineProps({
  comment: {
    type: String,
    default: ''
  },
  comments: {
    type: Array,
    default: () => []
  },
  count: {
    type: Number,
    default: null
  },
  to: {
    type: String,
    default: noop
  },
  disabled: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    default: ''
  },
  hasOldest: {
    type: Boolean,
    default: false
  },
  hasNewest: {
    type: Boolean,
    default: false
  },
  noToggler: {
    type: Boolean,
    default: false
  },
  noSort: {
    type: Boolean,
    default: false
  }
})

defineEmits(['goToNewest', 'goToOldest', 'submit'])
</script>

<template>
  <document-user-actions-card
    :icon="PhChatsTeardrop"
    :title="$tc('documentUserActions.comments', count ?? comments.length)"
    show-warning
    action-end
  >
    <slot name="header">
      <document-user-comments-header
        v-if="comments.length"
        v-model:visible="visible"
        :no-toggler="noToggler"
        :no-sort="noSort"
      />
    </slot>
    <document-user-comments-list
      v-model:visible="visible"
      :comments="comments"
      :to="to"
      :has-comments="hasComments"
      :has-newest="hasNewest"
      :has-oldest="hasOldest"
      @goToNewest="$emit('goToNewest')"
      @goToOldest="$emit('goToOldest')"
    >
      <slot name="comments" />
    </document-user-comments-list>
    <template #action-warning>
      <slot name="warning">
        {{ $t('documentUserComments.warning') }}
      </slot>
    </template>
    <template #action>
      <document-user-comments-form :model-value="comment" :disabled="disabled" @submit="$emit('submit', $event)" />
    </template>
  </document-user-actions-card>
</template>
