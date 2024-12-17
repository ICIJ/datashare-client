<script setup>
import { computed } from 'vue'

import DocumentLocalSearchInput from './DocumentLocalSearchInput'
import DocumentLocalSearchNav from './DocumentLocalSearchNav'
import DocumentLocalSearchOccurrences from './DocumentLocalSearchOccurrences'

const modelValue = defineModel({ type: String, default: '' })
const activeIndex = defineModel('activeIndex', { type: Number, default: 0 })

const props = defineProps({
  occurrences: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean
  }
})

const disabledPrevious = computed(() => !props.modelValue || props.activeIndex <= 1)
const disabledNext = computed(() => !props.modelValue || props.activeIndex === props.occurrences)
const previous = () => (activeIndex.value = Math.max(1, activeIndex.value - 1))
const next = () => (activeIndex.value = Math.min(props.occurrences, activeIndex.value + 1))
</script>

<template>
  <div class="document-local-search d-flex">
    <document-local-search-input
      v-model="modelValue"
      class="flex-grow-1"
      :loading="loading"
      @keyup.enter="next"
      @keyup.enter.shift="previous"
    />
    <document-local-search-nav
      :disabled-previous="disabledPrevious"
      :disabled-next="disabledNext"
      class="ms-2"
      @previous="previous"
      @next="next"
    />
    <document-local-search-occurrences
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
  display: inline-flex;
  border-radius: var(--bs-border-radius);
}
</style>
