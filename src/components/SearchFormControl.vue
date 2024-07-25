<script setup>
import { computed, ref } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
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
   * Icon name in the start slot
   */
  iconName: {
    type: String,
    default: 'magnifying-glass'
  },
  /**
   * Add clear text option
   */
  clearText: {
    type: Boolean
  },
  /**
   * Set the autofocus on the search bar on load
   */
  autofocus: {
    type: Boolean,
    default: false
  },
  /**
   * Round the border of the input
   */
  rounded: {
    type: Boolean,
    default: false
  },
  /**
   * Change the state of the input to "loading" (with a spinner)
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * Search input size (sm, md, lg)
   */
  size: {
    type: String,
    default: 'md',
    validator: function (value) {
      return ['sm', 'md', 'lg'].includes(value)
    }
  },
  /**
   * Disable autocomplete by default.
   */
  autocomplete: {
    type: String,
    default: 'off'
  },
  /**
   * Add light shadow around the form input
   */
  shadow: {
    type: Boolean,
    default: false
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

function clearInputText() {
  target.value?.querySelector('.search-form-control__input').focus()
  input('')
}

const classList = computed(() => {
  return {
    'search-form-control--shadow': props.shadow,
    [`search-form-control--${props.size}`]: true
  }
})
</script>

<template>
  <form class="search-form-control" :class="classList" @submit.prevent="$emit('submit', modelValue)">
    <div class="search-form-control__input-group input-group">
      <span
        class="search-form-control__start input-group-text border-end-0"
        :class="{ 'search-form-control--rounded--start': rounded }"
      >
        <slot name="input-start" v-bind="{ loading, noIcon }">
          <phosphor-icon
            v-if="!noIcon"
            :name="loading ? 'circle-notch' : iconName"
            square
            :spin="loading"
          ></phosphor-icon>
        </slot>
      </span>
      <b-form-input
        :size="size"
        :model-value="modelValue"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        class="search-form-control__input border-start-0 border-end-0 mx-0 px-0"
        :class="{
          'search-form-control__input--no-icon': noIcon,
          'search-form-control__input--no-clear-text': noIcon,
          'search-form-control--rounded--start': rounded && noIcon,
          'search-form-control--rounded--end': rounded && !clearText
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
        class="search-form-control__end input-group-text border-start-0"
        :class="{ 'search-form-control--rounded--end': rounded }"
      >
        <icon-button
          v-if="clearText"
          icon-left="x"
          hide-label
          variant="outline-secondary"
          :size="size"
          class="search-form-control__clear__icon p-1 border-0"
          :class="{
            'search-form-control__clear__icon--hide': !showClearText
          }"
          @click="clearInputText()"
        />
        <slot name="input-end" v-bind="{ loading, clearText }"> </slot>
      </span>
    </div>
  </form>
</template>

<style lang="scss" scoped>
@include color-mode(dark) {
  .search-form-control--shadow {
    box-shadow: none;
  }
}

.search-form-control {
  border-radius: 6px;

  &__start,
  &__end {
    background-color: var(--bs-body-bg);
    color: $secondary;
    transition: $input-transition;
  }

  &--rounded {
    &--start {
      border-bottom-left-radius: $border-radius-pill;
      border-top-left-radius: $border-radius-pill;
    }
    &--end {
      border-bottom-right-radius: $border-radius-pill;
      border-top-right-radius: $border-radius-pill;
    }
  }

  &__input:focus,
  &__input:hover {
    border: 0;
    box-shadow: none;
  }

  &__input-group:has(&__input:focus),
  &__input-group:has(&__input:hover) {
    box-shadow: none;

    .search-form-control__start {
      border-left: 1px solid $input-focus-border-color;
      border-top: 1px solid $input-focus-border-color;
      border-bottom: 1px solid $input-focus-border-color;
    }
    .search-form-control__input {
      border-top: 1px solid $input-focus-border-color;
      border-bottom: 1px solid $input-focus-border-color;
    }
    .search-form-control__end {
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

  .form-control-lg {
    padding: 1em;
  }

  &--shadow {
    box-shadow: 0.05em 0.05em 0.5em 0.3em $light;
  }

  &--shadow.search-form-control--sm {
    box-shadow: 1px 1px 8px 5px $light;
  }
}
</style>
