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
    value: {
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
    }
  },
  computed: {
    searchFormClassAttr() {
      return {
        'search-form-control--fill-submit': this.fillSubmit,
        'search-form-control--show-submit-label': this.showSubmitLabel,
        'search-form-control--no-icon': this.noIcon,
        'search-form-control--rounded': this.rounded,
        'search-form-control--loading': this.loading
      }
    }
  }
}
</script>

<template>
  <b-form @submit.prevent="$emit('submit', value)">
    <b-input-group size="sm" class="search-form-control" :class="searchFormClassAttr">
      <b-form-input
        :autofocus="autofocus"
        class="search-form-control__input"
        @input="$emit('input', $event)"
        :placeholder="placeholder"
        :value="value"
      ></b-form-input>
      <b-input-group-append class="search-form-control__addon search-form-control__addon--append">
        <b-button variant="light" class="search-form-control__addon__submit" type="submit">
          <template v-if="!noIcon">
            <fa v-if="loading" icon="circle-notch" spin fixed-width></fa>
            <fa v-else icon="search" fixed-width></fa>
          </template>
          <span :class="{ 'sr-only': !showSubmitLabel }">
            {{ submitLabel || $t('searchFormControl.submitLabel') }}
          </span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
  </b-form>
</template>

<style lang="scss" scoped>
.search-form-control {
  position: relative;

  &__input:focus {
    border-right: 0;
    box-shadow: none;
  }

  &__input:focus + &__addon &__addon__submit {
    border-color: $input-focus-border-color;
  }

  &__input:focus + &__addon:after {
    box-shadow: $input-focus-box-shadow;
    border-radius: $input-border-radius;
  }

  &--rounded &__input {
    border-bottom-left-radius: $rounded-pill;
    border-top-left-radius: $rounded-pill;
  }

  &--rounded &__input:focus + &__addon:after {
    border-radius: $rounded-pill;
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
  }

  &--rounded &__addon {
    &:after {
      border-radius: $rounded-pill;
    }

    &__submit:last-of-type {
      border-bottom-right-radius: $rounded-pill;
      border-top-right-radius: $rounded-pill;
    }
  }

  &--fill-submit &__addon__submit.btn {
    @include gradient-bg($primary);
    border-color: $primary;
    color: color-yiq($primary);
  }
}
</style>
