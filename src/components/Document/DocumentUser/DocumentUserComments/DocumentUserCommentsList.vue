<script setup>
import { computed } from 'vue'
import { noop } from 'lodash'

import DocumentUserCommentsListEntry from '@/components/Document/DocumentUser/DocumentUserComments/DocumentUserCommentsListEntry'
import DocumentUserCommentsListNewest from '@/components/Document/DocumentUser/DocumentUserComments/DocumentUserCommentsListNewest'
import DocumentUserCommentsListOldest from '@/components/Document/DocumentUser/DocumentUserComments/DocumentUserCommentsListOldest'

defineOptions({ name: 'DocumentUserCommentsList' })

const visible = defineModel('visible', {
  type: Boolean,
  default: true
})

defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  to: {
    type: String,
    default: noop
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  },
  hasOldest: {
    type: Boolean,
    default: false
  },
  hasNewest: {
    type: Boolean,
    default: false
  }
})

defineEmits(['goToNewest', 'goToOldest'])
</script>

<template>
  <div class="document-user-comments-list">
    <b-collapse v-model="visible" tag="section">
      <div class="d-flex flex-column gap-1 align-items-center">
        <document-user-comments-list-oldest v-if="hasOldest" @click="$emit('goToOldest')" />
        <div v-if="comments.length" class="document-user-comments-list__entries">
          <slot name="default" v-bind="{ visible, comments }">
            <document-user-comments-list-entry
              v-for="(comment, index) in comments"
              :id="`comment-${index}`"
              :key="index"
              :text="comment.text"
              :href="to(comment)"
              :date="comment.date"
              :username="comment.username"
            />
          </slot>
        </div>
        <document-user-comments-list-newest v-if="hasNewest" @click="$emit('goToNewest')" />
      </div>
    </b-collapse>
  </div>
</template>

<style lang="scss" scoped>
.document-user-comments-list {
  &__entries {
    max-height: 390px;
    overflow: auto;
  }
}
</style>
