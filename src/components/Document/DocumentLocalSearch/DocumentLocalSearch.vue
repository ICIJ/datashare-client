<script setup>
import { computed } from 'vue'

import DocumentLocalSearchInput from './DocumentLocalSearchInput'
import DocumentLocalSearchNav from './DocumentLocalSearchNav'
import DocumentLocalSearchOccurrences from './DocumentLocalSearchOccurrences'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  activeIndex: {
    type: Number,
    default: 0
  },
  occurrences: {
    type: Number,
    default: 0
  }
})

const disabledPrevious = computed(() => !props.modelValue || props.activeIndex === 0)
const disabledNext = computed(() => !props.modelValue || props.activeIndex === props.occurrences)
</script>

<template>
  <div class="document-local-search d-flex">
    <document-local-search-input
      :model-value="modelValue"
      class="flex-grow-1"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
    <document-local-search-nav
      :disabled-previous="disabledPrevious"
      :disabled-next="disabledNext"
      class="ms-2"
      @previous="$emit('update:activeIndex', activeIndex - 1)"
      @next="$emit('update:activeIndex', activeIndex + 1)"
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
