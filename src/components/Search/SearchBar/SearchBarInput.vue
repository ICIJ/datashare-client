<template>
  <form-control-search
    ref="input"
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
      <div class="d-flex flew-nowrap gap-1">
        <slot name="addons"></slot>
      </div>
      <button-icon
        v-if="showSubmit"
        icon-left="magnifying-glass"
        variant="action"
        class="search-bar-input__submit"
        type="submit"
        :disabled="disableSubmit"
      >
        {{ $t('search.buttonLabel') }}
      </button-icon>
      <slot name="suggestions"></slot>
    </template>
  </form-control-search>
</template>

<script>
import settings from '@/utils/settings'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import ButtonIcon from '@/components/Button/ButtonIcon'

/**
 * The general search input group with field options.
 */
export default {
  name: 'SearchBarInput',
  components: { FormControlSearch, ButtonIcon },
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
    localizedPlaceholder() {
      return this.placeholder ?? this.$t('search.placeholder')
    }
  },
  methods: {
    onBlur(e) {
      this.$emit('blur', e)
    },
    onInput(e) {
      this.$emit('input', e)
    },
    onFocus(e) {
      this.$emit('focus', e)
    },
    focus() {
      this.$refs.input.focus()
    }
  }
}
</script>
