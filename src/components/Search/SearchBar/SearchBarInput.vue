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
      <div v-if="!compact" class="d-flex flew-nowrap gap-1">
        <slot name="addons"></slot>
      </div>
      <b-button
        v-if="showSubmit"
        variant="action"
        class="search-bar-input__submit"
        type="submit"
        :disabled="disableSubmit"
      >
        {{ $t('search.buttonLabel') }}
      </b-button>
      <slot name="suggestions"></slot>
    </template>
  </form-control-search>
</template>

<script>
import settings from '@/utils/settings'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

/**
 * The general search input group with field options.
 */
export default {
  name: 'SearchBarInput',
  components: { FormControlSearch },
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
     * Show submit button
     */
    showSubmit: {
      type: Boolean,
      default: false
    },
    /**
     * Search input is compact (addons are hidden)
     */
    compact: {
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

<style lang="scss" scoped>
.search-bar-input:deep(.form-control-lg) {
  font-size: 1rem;
}
</style>
