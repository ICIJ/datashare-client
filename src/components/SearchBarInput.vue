<template>
  <search-form-control
    v-model="value"
    class="search-bar-input"
    :placeholder="localizedPlaceholder"
    :size="size"
    :clear-text="true"
    shadow
    @blur="onBlur"
    @input="onInput"
    @focus="onFocus"
  >
    <template #input-end>
      <a
        v-if="!hideTips"
        v-b-tooltip.body.bottomleft
        tabindex="-1"
        class="search-bar-input__tips-addon ms-2"
        target="_blank"
        :class="{ 'search-bar-input__tips-addon--active': showTips }"
        :href="operatorLink"
        :title="$t('search.tips')"
      >
        <phosphor-icon name="question" />
      </a>
      <slot name="addons"></slot>
      <icon-button
        v-if="showSubmit"
        icon-left="magnifying-glass"
        variant="action"
        class="search-bar-input__submit ms-2"
        type="submit"
        :disabled="disableSubmit"
      >
        {{ $t('search.buttonLabel') }}</icon-button
      >

      <slot name="suggestions"></slot
    ></template>
  </search-form-control>
</template>

<script>
import settings from '@/utils/settings'
import SearchFormControl from '@/components/SearchFormControl'
import IconButton from '@/components/IconButton'

/**
 * The general search input group with field options.
 */
export default {
  name: 'SearchBarInput',
  components: [SearchFormControl, IconButton],
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
    },
    /**
     * Hide the submit button icon in the input bar
     */
    showSubmit: {
      type: Boolean,
      default: false
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
