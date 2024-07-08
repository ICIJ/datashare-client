<script setup>
import { computed, ref } from 'vue'

import PhosphorIcon from '@/components/PhosphorIcon'
/**
 * A search input with pill layout.
 */
defineOptions({
  name: 'SearchFormControl'
})
const props = defineProps({
  /**
   * Input value
   * @model
   */
  modelValue: {
    type: [String, Number]
  },
  /**
   * Optional placeholder text
   */
  placeholder: {
    type: String
  },
  /**
   * Hide the magnifying glass icon
   */
  noIcon: {
    type: Boolean
  },
  /**
   * Add clear text icon
   */
  clearTextIcon: {
    type: Boolean
  },
  /**
   * Set the autofocus on the search bar on load
   */
  autofocus: {
    type: Boolean,
    default: true
  },
  /**
   * Round the border of the input
   */
  rounded: {
    type: Boolean,
    default: true
  },
  /**
   * Change the state of the input to "loading" (with a spinner)
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * Use sm sizing
   */
  small: {
    type: Boolean,
    default: false
  },
  /**
   * Disable autocomplete by default.
   */
  autocomplete: {
    type: String,
    default: 'off'
  }
})
const emit = defineEmits(['submit', 'up', 'down', 'input', 'update:modelValue', 'enter', 'blur'])
const showClearText = computed(() => {
  return props.modelValue?.length > 0
})
function input(value) {
  emit('update:modelValue', value)
}
const target = ref(null)

function clearText() {
  target.value?.querySelector('.search-form-control__input').focus()
  input('')
}

const size = computed(() => (props.small ? 'sm' : 'md'))
</script>

<template>
  <form ref="target" class="search-form-control" @submit.prevent="$emit('submit', modelValue)">
    <div class="search-form-control__input-group input-group mb-3">
      <template v-if="!noIcon">
        <span
          class="search-form-control__icon input-group-text border-end-0"
          :class="{ 'search-form-control--rounded--left': rounded }"
        >
          <phosphor-icon :name="loading ? 'circle-notch' : 'magnifying-glass'" square :spin="loading"></phosphor-icon>
        </span>
      </template>
      <b-form-input
        :size="size"
        :model-value="modelValue"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        class="search-form-control__input"
        :class="{
          'search-form-control__input--no-icon': noIcon,
          'search-form-control__input--no-clear-text': noIcon,
          'border-start-0': !noIcon,
          'border-end-0': clearTextIcon,
          'search-form-control--rounded--left': rounded && noIcon,
          'search-form-control--rounded--right': rounded && !clearTextIcon
        }"
        :placeholder="placeholder"
        @keydown.up="$emit('up', $event)"
        @keydown.down="$emit('down', $event)"
        @keydown.enter="$emit('enter', $event)"
        @keydown.esc="$event.target.blur()"
        @update:modelValue="input"
        @blur="$emit('blur', $event)"
      />

      <span
        v-if="clearTextIcon"
        class="search-form-control__clear input-group-text border-start-0"
        :class="{ 'search-form-control--rounded--right': rounded }"
      >
        <phosphor-icon
          name="x-circle"
          square
          class="search-form-control__clear__icon"
          :class="{
            'search-form-control__clear__icon--hide': !showClearText
          }"
          @click="clearText()"
        />
      </span>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.search-form-control {
  &__icon,
  &__clear {
    background-color: var(--bs-body-bg);
    color: $tertiary;
  }
  &--rounded {
    &--left {
      border-bottom-left-radius: $border-radius-pill;
      border-top-left-radius: $border-radius-pill;
    }
    &--right {
      border-bottom-right-radius: $border-radius-pill;
      border-top-right-radius: $border-radius-pill;
    }
  }
  &__input {
    &--no-icon {
      border-left: 1px solid $input-border-color;
    }
  }
  &__input:focus {
    border: 0;
    box-shadow: none;
  }
  &__input-group:has(&__input:focus) {
    box-shadow: none;
    .search-form-control__icon {
      border-left: 1px solid $input-focus-border-color;
      border-top: 1px solid $input-focus-border-color;
      border-bottom: 1px solid $input-focus-border-color;
    }
    .search-form-control__input {
      &--no-icon {
        border-left: 1px solid $input-focus-border-color;
      }
      &--no-clear-text {
        border-right: 1px solid $input-focus-border-color;
      }
      border-top: 1px solid $input-focus-border-color;
      border-bottom: 1px solid $input-focus-border-color;
    }
    .search-form-control__clear {
      border-right: 1px solid $input-focus-border-color;
      border-top: 1px solid $input-focus-border-color;
      border-bottom: 1px solid $input-focus-border-color;
    }
  }
  &__clear__icon {
    &--hide {
      visibility: hidden;
    }
  }
}
</style>
