<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import FormControlTagEntry from './FormControlTagEntry'

const props = defineProps({
  modelValue: {
    type: Array
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
  size: {
    type: String,
    default: 'md'
  },
  separator: {
    type: [String, Array],
    default: () => [',', ';']
  },
  state: {
    type: Boolean,
    default: null
  }
})

const { t } = useI18n()

const placeholderIfEmpty = computed(() => {
  if (props.modelValue.length > 0) {
    return null
  }
  return props.placeholder ?? t('formControlTag.placeholder')
})
</script>

<template>
  <b-form-tags
    class="form-control-tag"
    remove-on-delete
    :separator="separator"
    :placeholder="placeholderIfEmpty"
    :add-button-text="addButtonText ?? $t('formControlTag.addButtonText')"
    :invalid-tag-text="invalidTagText ?? $t('formControlTag.invalidTagText')"
    :duplicate-tag-text="duplicateTagText ?? $t('formControlTag.duplicateTagText')"
    :model-value="modelValue"
    :size="size"
    :state="state"
    add-button-variant="action"
    no-outer-focus
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <template #tag="{ tag, removeTag }">
      <slot name="tag" v-bind="{ tag, removeTag }">
        <form-control-tag-entry :label="tag" :size="size" @click="removeTag(tag)" />
      </slot>
    </template>
  </b-form-tags>
</template>

<style lang="scss">
.form-control-tag {
  padding: $spacer-xs;

  &.focus,
  &:focus {
    box-shadow: none;
    border-color: $input-focus-border-color;
  }

  .b-form-tags-list {
    column-gap: $spacer-xxs;
    row-gap: $spacer-xs;
  }

  .b-form-tags-button {
    padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x) !important;
  }

  &.form-control-sm {
    .b-form-tags-button {
      --bs-btn-padding-y: #{$btn-padding-y-sm};
      --bs-btn-padding-x: #{$btn-padding-x-sm};
      --bs-btn-font-size: #{$btn-font-size-sm};
      --bs-btn-border-radius: var(--bs-border-radius-sm);
    }
  }

  &.form-control-lg {
    .b-form-tags-button {
      --bs-btn-padding-y: #{$btn-padding-y-lg};
      --bs-btn-padding-x: #{$btn-padding-x-lg};
      --bs-btn-font-size: #{$btn-font-size-lg};
      --bs-btn-border-radius: var(--bs-border-radius-lg);
    }
  }

  &.b-form-tags .b-form-tags-list,
  &.b-form-tags .b-form-tags-list .b-form-tag,
  &.b-form-tags .b-form-tags-list .b-from-tags-field {
    margin: 0;
  }
}
</style>
