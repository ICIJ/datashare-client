<template>
  <div class="search-bar-input input-group" :class="{ ['input-group-' + size]: true }">
    <input
      ref="input"
      v-model="value"
      class="form-control search-bar-input__input"
      :placeholder="localizedPlaceholder"
      @blur="onBlur"
      @input="onInput"
      @focus="onFocus"
    />
    <a
      v-if="!hideTips"
      v-b-tooltip.body.bottomleft
      tabindex="-1"
      class="search-bar-input__tips-addon input-group-text px-2"
      target="_blank"
      :class="{ 'search-bar-input__tips-addon--active': showTips }"
      :href="operatorLink"
      :title="$t('search.tips')"
    >
      <fa icon="circle-question" fixed-width />
    </a>
    <slot name="addons"></slot>
    <button type="submit" class="btn btn-primary search-bar-input__submit" :disabled="disableSubmit">
      <fa icon="magnifying-glass" class="d-inline d-md-none" :title="$t('search.buttonLabel')" /><span
        class="d-none d-md-inline"
        >{{ $t('search.buttonLabel') }}</span
      >
    </button>
    <slot name="suggestions"></slot>
  </div>
</template>

<script>
import settings from '@/utils/settings'

/**
 * The general search input group with field options.
 */
export default {
  name: 'SearchBarInput',
  props: {
    /**
     * Placeholder in the search bar.
     */
    placeholder: {
      type: String,
      default: ''
    },
    /**
     * Search input query
     */
    modelValue: {
      type: String
    },
    /**
     * Search input size
     * @values sm, md, lg
     */
    size: {
      type: String,
      default: 'md'
    },
    /**
     * Disable submit button
     */
    disableSubmit: {
      type: Boolean,
      default: false
    },
    /**
     * Hide tips icon in the input bar
     */
    hideTips: {
      type: Boolean
    }
  },
  emits: ['blur', 'input', 'focus', 'update:modelValue'],
  computed: {
    operatorLink() {
      return settings.documentationLinks.operators.default
    },
    value: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    showTips() {
      return !this.hideTips && this.modelValue?.length
    },
    localizedPlaceholder() {
      return this.placeholder ?? this.$t('search.placeholder')
    }
  },
  methods: {
    onBlur() {
      this.$emit('blur')
    },
    onInput() {
      this.$emit('input')
    },
    onFocus() {
      this.$emit('focus')
    },
    focus() {
      this.$refs.input.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
.search-bar-input {
  .input-group {
    filter: drop-shadow(0 0.3em 0.6em rgba(black, 0));
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  .input-group-md &__input.form-control,
  .input-group-lg &__input.form-control {
    border-radius: 1.5em 0 0 1.5em;
  }

  &__input.form-control {
    border-right: 0;

    &:focus + .search-bar-input__tips-addon,
    &:focus + .search-bar-input__field:deep(.btn),
    &:focus + :deep(.search-bar-input__field .btn) {
      border-bottom-color: $input-focus-border-color;
      border-top-color: $input-focus-border-color;
    }

    &:focus {
      box-shadow: none;
    }
  }

  &__tips-addon.input-group-text {
    background: white;
    border-left: 0;
    border-right: 0;
    box-shadow: $input-box-shadow;
    color: transparent;
    pointer-events: none;
    transition: $input-transition, color 0.15s ease-in-out;
  }

  &__tips-addon--active.input-group-text {
    color: $link-color;
    pointer-events: all;
  }

  &__tips {
    border-radius: 0 0 $input-border-radius $input-border-radius;
    display: block;
    font-size: 0.9rem;
    padding: $spacer * 0.5 0 0;
    z-index: 100;
  }

  &.input-group > &__submit.btn {
    border-bottom-right-radius: 1.5em;
    border-top-right-radius: 1.5em;
  }
}
</style>
