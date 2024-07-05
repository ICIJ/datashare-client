<script setup>
import { computed, ref, watch } from 'vue'
import { useColorMode } from 'bootstrap-vue-next'

import PhosphorIcon from '@/components/PhosphorIcon'
import IconButton from '@/components/IconButton'
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
   * Display the input and button on a dark background
   */
  dark: {
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
function clearText() {
  document.querySelector('.search-form-control__input').focus()
  input('')
}

const target = ref(null)

const mode = useColorMode({
  selector: target
})

watch(
  () => props.dark,
  (dark) => {
    mode.value = dark ? 'dark' : 'light'
  },
  { immediate: true }
)

const size = computed(() => (props.small ? 'sm' : 'md'))
</script>

<template>
  <form ref="target" class="search-form-control" @submit.prevent="$emit('submit', modelValue)">
    <div class="search-form-control__input-group input-group mb-3">
      <template v-if="!noIcon">
        <span
          class="search-form-control__icon input-group-text"
          :class="{ 'search-form-control__icon--rounded': rounded }"
        >
          <phosphor-icon :name="loading ? 'circle-notch' : 'magnifying-glass'" square :spin="loading"></phosphor-icon>
        </span>
      </template>
      <b-form-input
        :model-value="modelValue"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        class="search-form-control__input"
        :class="{ 'search-form-control__input--no-icon': noIcon, 'search-form-control__input--rounded': rounded }"
        :placeholder="placeholder"
        @keydown.up="$emit('up', $event)"
        @keydown.down="$emit('down', $event)"
        @keydown.enter="$emit('enter', $event)"
        @keydown.esc="$event.target.blur()"
        @update:modelValue="input"
        @blur="$emit('blur', $event)"
      />

      <span
        class="search-form-control__clear input-group-text"
        :class="{ 'search-form-control__clear--rounded': rounded }"
      >
        <icon-button
          icon-left="backspace"
          square
          :size="size"
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
  &__icon {
    border-right: 0;
    &--rounded {
      border-bottom-left-radius: $border-radius-pill;
      border-top-left-radius: $border-radius-pill;
    }
  }
  &__clear {
    border-left: 0;
    &--rounded {
      border-bottom-left-radius: $border-radius-pill;
      border-top-left-radius: $border-radius-pill;
    }
  }
  &__input {
    border-left: 0;
    border-right: 0;
    &--no-icon {
      border-left: 1px solid $input-border-color;
    }
    &--rounded {
      border-bottom-left-radius: $border-radius-pill;
      border-top-left-radius: $border-radius-pill;
    }
  }
  &__input:focus {
    border: 0;
    box-shadow: none;
  }
  &__clear {
    &--rounded {
      border-bottom-right-radius: $border-radius-pill;
      border-top-right-radius: $border-radius-pill;
    }
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
