<script setup>
import FormControlTag from './FormControlTag/FormControlTag'

import SearchBreadcrumbEntry from '@/components/Search/SearchBreadcrumb/SearchBreadcrumbEntry'

defineProps({
  modelValue: {
    type: Array
  },
  size: {
    type: String,
    default: 'md'
  },
  addButtonText: {
    type: String,
    default: null
  },
  invalidTagText: {
    type: String,
    default: null
  },
  duplicateTagText: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: null
  },
  separator: {
    type: [String, Array],
    default: () => [' ', 'OR']
  },
  state: {
    type: Boolean,
    default: null
  }
})
</script>

<template>
  <form-control-tag
    class="form-control-term"
    :separator="separator"
    :placeholder="placeholder ?? $t('formControlTerm.placeholder')"
    :add-button-text="addButtonText ?? $t('formControlTerm.addButtonText')"
    :invalid-tag-text="invalidTagText ?? $t('formControlTerm.invalidTagText')"
    :duplicate-tag-text="duplicateTagText ?? $t('formControlTerm.duplicateTagText')"
    :model-value="modelValue"
    :size="size"
    :state="state"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <template #tag="{ tag, removeTag }">
      <search-breadcrumb-entry class="p-0" :query="tag" :size="size" no-occurrences no-caret @click="removeTag(tag)" />
    </template>
  </form-control-tag>
</template>

<style lang="scss" scoped>
.form-control-term {
  &:deep(.b-form-tags-input) {
    min-width: 0;
  }
}
</style>
