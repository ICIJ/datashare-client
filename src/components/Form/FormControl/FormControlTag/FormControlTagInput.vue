<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhosphorIcon } from '@icij/murmur-next'

import FormControlTagInputEntry from './FormControlTagInputEntry'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  modelValue: {
    type: Array
  },
  inputValue: {
    type: String
  },
  addButtonText: {
    type: String,
    default: null
  },
  addButtonSize: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: null
  },
  placeholderIcon: {
    type: String,
    default: 'tag'
  },
  size: {
    type: String,
    default: 'md'
  },
  disabled: {
    type: Boolean
  },
  noTags: {
    type: Boolean
  },
  noClear: {
    type: Boolean
  },
  noPlaceholderIcon: {
    type: Boolean
  }
})

const { t } = useI18n()
const inputElement = ref(null)
const focus = ref(false)
const emit = defineEmits(['blur', 'focus', 'clear', 'removeLastTag', 'addTag', 'update:inputValue'])

const placeholderIfEmpty = computed(() => {
  if (!props.noTags && props.modelValue.length > 0) {
    return null
  }
  return props.placeholder ?? t('formControlTagInput.placeholder')
})

const showPlaceholderIcon = computed(() => {
  return props.noTags || (!props.noPlaceholderIcon && props.modelValue.length === 0)
})

const onBlur = () => {
  focus.value = false
  emit('blur')
}

const onFocus = () => {
  focus.value = true
  emit('focus')
}

const onInput = (event) => {
  emit('update:inputValue', event.target.value)
}

const classList = computed(() => {
  return {
    [`form-control-tag-input--${props.size}`]: true,
    'form-control-tag-input--focus': focus.value,
    'form-control-tag-input--has-value': props.inputValue,
    'form-control-tag-input--has-model-value': !!props.modelValue.length
  }
})

const tags = computed(() => {
  return props.noTags ? [] : props.modelValue
})

defineExpose({
  focus() {
    inputElement.value.focus()
  }
})
</script>

<template>
  <div class="form-control-tag-input" :class="classList">
    <template v-for="(tag, index) in tags">
      <slot name="tag" v-bind="{ tag }">
        <form-control-tag-input-entry :key="index" :label="tag" :size="size" @click="$emit('removeTag', tag)" />
      </slot>
    </template>
    <div class="form-control-tag-input__form">
      <phosphor-icon
        v-if="showPlaceholderIcon"
        :name="placeholderIcon"
        class="form-control-tag-input__form__icon text-secondary ms-2 me-1"
      />
      <input
        ref="inputElement"
        class="form-control form-control-tag-input__form__field"
        :placeholder="placeholderIfEmpty"
        :value="inputValue"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
        @keydown.delete="$emit('removeLastTag', $event)"
        @keydown.enter="$emit('addTag', inputValue)"
      />
      <button-icon
        v-if="!noClear"
        icon-left="x"
        variant="outline-secondary"
        hide-label
        class="form-control-tag-input__form__clear border-0 me-1"
        @click="$emit('clear')"
      />
      <b-button
        v-if="inputValue"
        :size="addButtonSize ?? size"
        :disabled="disabled"
        type="button"
        class="form-control-tag-input__form__submit text-nowrap"
        variant="action"
        @click="$emit('addTag', inputValue)"
      >
        {{ addButtonText ?? $t('formControlTagInput.addButtonText') }}
      </b-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-control-tag-input {
  display: flex;
  flex-wrap: wrap;
  column-gap: $spacer-xxs;
  row-gap: $spacer-xs;
  padding: 2px;
  width: 100%;

  font-family: $input-font-family;
  font-size: $input-font-size;
  font-weight: $input-font-weight;
  line-height: $input-line-height;
  color: $input-color;
  min-height: 46px;

  appearance: none;
  background-color: $input-bg;
  background-clip: padding-box;
  border: $input-border-width solid $input-border-color;
  border-radius: $input-border-radius;

  transition: $input-transition;

  &--sm {
    min-height: calc(1.25em + 0.5rem + calc(var(--bs-border-width) * 2));
  }

  &--lg &__form__field {
    font-size: $input-font-size-lg;
  }

  &--focus {
    color: $input-focus-color;
    background-color: $input-focus-bg;
    border-color: $input-focus-border-color;
    outline: 0;
    box-shadow: $input-focus-box-shadow;
  }

  &--has-model-value &__form__clear {
    visibility: visible;
  }

  &__form {
    display: flex;
    flex: 1;

    &__field {
      padding-block: 0;
      padding-inline: calc(#{$input-padding-x} - #{$spacer-xs});
      flex: 0 1 auto;
      min-width: 5rem;
      color: inherit;
      height: 100%;

      &,
      &:focus {
        outline: 0;
        border: 0;
        box-shadow: none;
      }
    }

    &__clear {
      visibility: hidden;
    }

    &__clear,
    &__submit {
      padding-block: 0;
    }
  }
}
</style>
