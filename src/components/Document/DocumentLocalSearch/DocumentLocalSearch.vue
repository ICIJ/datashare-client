<script setup>
import { computed, useTemplateRef } from 'vue'

import DocumentLocalSearchInput from './DocumentLocalSearchInput'
import DocumentLocalSearchNav from './DocumentLocalSearchNav'
import DocumentLocalSearchOccurrences from './DocumentLocalSearchOccurrences'

import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const modelValue = defineModel({ type: String, default: '' })
const activeIndex = defineModel('activeIndex', { type: Number, default: 0 })

const props = defineProps({
  occurrences: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const input = useTemplateRef('input')

const disabledPrevious = computed(() => !props.modelValue || props.activeIndex <= 1)
const disabledNext = computed(() => !props.modelValue || props.activeIndex === props.occurrences)

const focus = () => input.value.focus()
const previous = () => (activeIndex.value = Math.max(1, activeIndex.value - 1))
const next = () => (activeIndex.value = Math.min(props.occurrences, activeIndex.value + 1))

const { wheneverActionShortcut, findActionKey } = useKeyboardShortcuts({
  passive: false,
  onEventFired(e) {
    // Only prevent default when the shortcut to find in document is triggered. This
    // way we can prevent the web browser from open the build-in "search in page".
    if (findInDocumentKey.value) {
      e.preventDefault()
    }
  }
})

// We get the key separetly in order to be able to use it in the `onEventFired` callback above
const findInDocumentKey = findActionKey('findInDocument')
// The "next occurence" shortcut ("enter") might overlap with the "previous occurence" shortcut ("shift+enter")
// so we need to check if the "previous occurence" shortcut is not triggered before going next.
const findPreviousOccurrenceKey = findActionKey('findPreviousOccurrence')

wheneverActionShortcut('findInDocument', focus)
wheneverActionShortcut('findPreviousOccurrence', previous)
wheneverActionShortcut('findNextOccurrence', () => !findPreviousOccurrenceKey.value && next())
</script>

<template>
  <div class="document-local-search">
    <document-local-search-input
      ref="input"
      v-model="modelValue"
      class="flex-grow-1"
      :loading="loading"
    />
    <document-local-search-nav
      :disabled-previous="disabledPrevious"
      :disabled-next="disabledNext"
      class="ms-2"
      @previous="previous"
      @next="next"
    />
    <document-local-search-occurrences
      v-if="!compact"
      :hidden="!modelValue"
      :active-index="activeIndex"
      :occurrences="occurrences"
      class="ms-2 align-self-center"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-local-search {
  display: flex;
  border-radius: var(--bs-border-radius);
}
</style>
