<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { computed } from 'vue'

import DocumentUserCommentsListEntry from '@/components/Document/DocumentUserActions/DocumentUserComments/DocumentUserCommentsListEntry.vue'

defineOptions({ name: 'DocumentUserCommentsList' })

const open = defineModel('open', {
  type: Boolean,
  default: true
})
const props = defineProps({
  comments: { type: Array, default: () => [] },
  height: { type: String, default: '250px' }
})
const style = {
  '--document-user-comments-list__comments__list--height': props.height
}

const firstComment = '#comment-0'
const lastComment = props.comments.length ? `#comment-${props.comments.length - 1}` : ''
const closedEye = computed(() => {
  return open.value ? 'regular' : 'fill'
})

const sortingText = 'From oldest to most recent'
const displayComments = computed(() => (open.value ? 'Hide comments' : 'Show comments'))
const goToOldest = 'Go to oldest'
const goToRecent = 'Go to most recent'
const noComments = 'No comments on this document yet.'
</script>

<template>
  <section class="document-user-comments-list">
    <header class="d-flex justify-content-between align-items-center">
      <span><phosphor-icon name="sortAscending" />{{ sortingText }}</span>
      <span
        class="document-user-comments-list__display-comments btn btn-outline-link d-inline-flex justify-content-between"
        @click="open = !open"
        ><phosphor-icon name="eyeClosed" :weight="closedEye" class="me-2" />{{ displayComments }}</span
      >
    </header>
    <section v-if="open" class="document-user-comments-list__comments py-2">
      <template v-if="comments.length">
        <header class="text-center py-2">
          <a :href="firstComment">{{ goToOldest }}</a>
        </header>
        <article class="document-user-comments-list__comments__list d-block overflow-y-scroll" :style="style">
          <document-user-comments-list-entry
            v-for="(comment, index) in comments"
            :id="`comment-${index}`"
            :key="index"
            :text="comment.text"
            :to="comment.to"
            :date="comment.date"
            :username="comment.username"
          />
        </article>
        <footer class="text-center py-2">
          <a :href="lastComment">{{ goToRecent }}</a>
        </footer>
      </template>
      <template v-else>
        <div class="text-center py-2">{{ noComments }}</div>
      </template>
    </section>
  </section>
</template>

<style scoped lang="scss">
.document-user-comments-list {
  &__display-comments {
    width: 200px;
  }
  &__comments__list {
    height: var(--document-user-comments-list__comments__list--height);
  }
}
</style>
