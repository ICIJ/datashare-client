<script setup>
import { useI18n } from 'vue-i18n'

import FormControlTag from './FormControlTag/FormControlTag'

const modelValue = defineModel('modelValue', { type: Array })

defineProps({
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
const { t } = useI18n()
</script>

<template>
  <form-control-tag
    v-model="modelValue"
    class="form-control-term"
    :separator="separator"
    :placeholder="placeholder ?? t('formControlTerm.placeholder')"
    :add-button-text="addButtonText ?? t('formControlTerm.addButtonText')"
    :invalid-tag-text="invalidTagText ?? t('formControlTerm.invalidTagText')"
    :duplicate-tag-text="duplicateTagText ?? t('formControlTerm.duplicateTagText')"
    :size="size"
    :state="state"
  >
    <template #tag="{ tag, removeTag }">
      <search-breadcrumb-form-entry
        class="p-0"
        :query="tag"
        :size="size"
        no-occurrences
        no-caret
        @click="removeTag(tag)"
      />
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
