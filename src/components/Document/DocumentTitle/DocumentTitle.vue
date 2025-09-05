<script setup>
import { computed } from 'vue'

import DocumentTitleSlice from '@/components/Document/DocumentTitle/DocumentTitleSlice'
import DocumentTitleSubject from '@/components/Document/DocumentTitle/DocumentTitleSubject'

const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object,
    required: true
  },
  /**
   * If true, the root slice will be a link to the root document
   */
  interactiveRoot: {
    type: Boolean,
    default: false
  }
})

const classList = computed(() => {
  return {
    'document-title--has-subject': hasSubject.value
  }
})

const slices = computed(() => props.document.slicedName)
const isSliced = computed(() => slices.value.length > 1)
const hasSubject = computed(() => !isSliced.value && props.document.hasSubject)
const subject = computed(() => props.document.subject)

const isFirstSlice = index => index === 0
const isLastSlice = index => index === slices.value.length - 1
const isRootSlice = index => slices.value.length > 1 && isFirstSlice(index)
const isMiddleSlice = index => !isFirstSlice(index) && !isLastSlice(index)
</script>

<template>
  <div
    class="document-title"
    :class="classList"
  >
    <document-title-subject
      v-if="hasSubject"
      :subject="subject"
    />
    <document-title-slice
      v-for="(slice, index) in slices"
      v-else
      :key="index"
      :slice="String(slice)"
      :is-root="isRootSlice(index)"
      :is-first="isFirstSlice(index)"
      :is-middle="isMiddleSlice(index)"
      :document="document"
      :interactive-root="interactiveRoot"
      class="document-title__item"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-title {
  display: inline-block;
  word-break: break-all;

  &__item {
    display: inline;

    // Slice separator
    &:not(:last-of-type):after {
      content: '❭';
      font-size: 0.5em;
      transform: translateY(-0.25em);
      line-height: 1em;
      opacity: 0.5;
      padding: 0 0.5em;
      display: inline-block;
    }
  }
}
</style>
