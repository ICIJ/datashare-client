<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import FormControlTagInputEntry from './FormControlTagInputEntry'

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
  placeholder: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: 'md'
  },
  disabled: {
    type: Boolean
  }
})

const { t } = useI18n()
const inputElement = ref(null)
const focus = ref(false)
const emit = defineEmits(['blur', 'focus', 'removeLastTag', 'addTag', 'update:inputValue'])

const placeholderIfEmpty = computed(() => {
  if (props.modelValue.length > 0) {
    return null
  }
  return props.placeholder ?? t('formControlTagInput.placeholder')
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
    'form-control-tag-input--focus': focus.value,
    'form-control-tag-input--has-value': props.inputValue
  }
})

defineExpose({
  focus() {
    inputElement.value.focus()
  }
})
</script>

<template>
  <div class="form-control-tag-input" :class="classList">
    <template v-for="(tag, index) in modelValue">
      <slot name="tag" v-bind="{ tag }">
        <form-control-tag-input-entry :key="index" :label="tag" :size="size" @click="$emit('removeTag', tag)" />
      </slot>
    </template>
    <div class="form-control-tag-input__form">
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
      <b-button
        :size="size"
        :disabled="disabled"
        type="button"
        class="form-control-tag-input__form__button"
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
  padding: $spacer-xs;
  width: 100%;

  font-family: $input-font-family;
  font-size: $input-font-size;
  font-weight: $input-font-weight;
  line-height: $input-line-height;
  color: $input-color;

  appearance: none;
  background-color: $input-bg;
  background-clip: padding-box;
  border: $input-border-width solid $input-border-color;
  border-radius: $input-border-radius;

  transition: $input-transition;

  &:deep(.form-control-tag-input-entry) + &__form &__form__field {
    padding-left: 0;
  }

  &--focus {
    color: $input-focus-color;
    background-color: $input-focus-bg;
    border-color: $input-focus-border-color;
    outline: 0;
    box-shadow: $input-focus-box-shadow;
  }

  &--has-value &__form__button {
    visibility: visible;
  }

  &__form {
    display: flex;
    flex: 1;

    &__button {
      visibility: hidden;
    }

    &__field {
      padding-block: 0;
      padding-inline: calc(#{$input-padding-x} - #{$spacer-xs});
      flex: 0 1 auto;
      min-width: 5rem;
      color: inherit;

      &,
      &:focus {
        outline: 0;
        border: 0;
        box-shadow: none;
      }
    }
  }
}
</style>
