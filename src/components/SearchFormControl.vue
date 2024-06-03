<script>
/**
 * A search input with pill layout.
 */
export default {
  name: 'SearchFormControl',
  props: {
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
     * Text to use in the submit button
     * @default $t('searchFormControl.submitLabel')
     */
    submitLabel: {
      type: String
    },
    /**
     * Fill the submit button with primary color
     */
    fillSubmit: {
      type: Boolean
    },
    /**
     * Show the text in the submit button (only visible for screen-readers by default)
     */
    showSubmitLabel: {
      type: Boolean
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
  },
  emits: ['submit', 'up', 'down', 'input', 'update:modelValue', 'enter', 'blur'],
  computed: {
    searchFormClassAttr() {
      return {
        'search-form-control--fill-submit': this.fillSubmit,
        'search-form-control--show-submit-label': this.showSubmitLabel,
        'search-form-control--no-icon': this.noIcon,
        'search-form-control--rounded': this.rounded,
        'search-form-control--loading': this.loading,
        'search-form-control--dark': this.dark,
        'input-group-sm': this.small
      }
    }
  },
  methods: {
    input(value) {
      this.$emit('update:modelValue', value)
    }
  }
}
</script>

<template>
  <form @submit.prevent="$emit('submit', modelValue)">
    <div class="input-group search-form-control" :class="searchFormClassAttr">
      <b-form-input
        :model-value="modelValue"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        class="search-form-control__input"
        :placeholder="placeholder"
        @keydown.up="$emit('up', $event)"
        @keydown.down="$emit('down', $event)"
        @keydown.enter="$emit('enter', $event)"
        @update:modelValue="input"
        @blur="$emit('blur', $event)"
      />
      <button class="btn search-form-control__submit" type="submit">
        <template v-if="!noIcon">
          <fa v-if="loading" icon="circle-notch" spin fixed-width></fa>
          <fa v-else icon="search" fixed-width></fa>
        </template>
        <span :class="{ 'sr-only': !showSubmitLabel }">
          {{ submitLabel || $t('searchFormControl.submitLabel') }}
        </span>
      </button>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.search-form-control {
  position: relative;

  &__input {
    border-right: 0;
  }

  &__input:focus {
    box-shadow: none;
  }

  &__input:focus + &__submit:last-of-type {
    box-shadow: none;
    border: 1px solid $input-focus-border-color;
  }

  &--rounded &__input {
    border-bottom-left-radius: $border-radius-pill;
    border-top-left-radius: $border-radius-pill;
  }

  &--rounded &__submit {
    border-bottom-right-radius: $border-radius-pill;
    border-top-right-radius: $border-radius-pill;
  }

  &__submit {
    background: $input-bg;
    border-color: $input-border-color;
    border-left: 0;
    transition: $input-transition;
  }

  &__addon {
    &:after {
      bottom: 0;
      box-shadow: 0 0 0 $input-btn-focus-width transparent;
      content: '';
      left: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: 0;
      transition: $input-transition;
      z-index: 0;
    }

    & &__submit:last-of-type {
      background: $input-bg;
      border-color: $input-border-color;
      border-left: 0;
      transition: $input-transition;
    }

    &__submit:last-of-type {
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
    }
  }


  &--rounded &__addon {
    &:after {
      border-radius: $border-radius-pill;
    }

    &__submit:last-of-type {
      border-bottom-right-radius: $border-radius-pill;
      border-top-right-radius: $border-radius-pill;
    }
  }

  &--fill-submit &__submit.btn {
    @include gradient-bg($primary);
    border-color: $primary;
    color: color-yiq($primary);
  }

  &--dark {
    color: $light;

    .search-form-control__input::placeholder {
      color: $text-muted;
    }

    .search-form-control__input,
    .search-form-control__submit:last-of-type {
      background: #000;
      color: inherit;
    }

    .search-form-control__input:not(:focus),
    .search-form-control__submit:last-of-type {
      border-color: #000;
    }
  }
}
</style>
