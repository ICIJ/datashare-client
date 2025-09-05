<script setup>
import { useTemplateRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

/**
 * The general search input group with field options.
 */
defineOptions({ name: 'SearchBarInput' })

/**
 * Search input query
 */
const modelValue = defineModel({ type: String })

const props = defineProps({
  /**
   * Placeholder in the search bar.
   */
  placeholder: {
    type: String,
    default: ''
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
})

const emit = defineEmits(['blur', 'input', 'focus', 'clear'])

const { t } = useI18n()

const localizedPlaceholder = computed(() => {
  return props.placeholder ?? t('search.placeholder')
})

const inputRef = useTemplateRef('input')
function focus() {
  inputRef.value.focus()
}
function blur() {
  inputRef.value.blur()
}
function clear() {
  inputRef.value.clear()
}

defineExpose({ focus, blur, clear })
</script>

<template>
  <form-control-search
    ref="input"
    v-model="modelValue"
    class="search-bar-input"
    :placeholder="localizedPlaceholder"
    :size="size"
    :clear-text="true"
    shadow
    @blur="emit('blur', $event)"
    @input="emit('input', $event)"
    @focus="emit('focus', $event)"
    @clear="emit('clear')"
  >
    <template #input-end>
      <div
        v-if="!compact"
        class="d-flex flew-nowrap gap-1"
      >
        <slot name="addons" />
      </div>
      <b-button
        v-if="showSubmit"
        variant="action"
        class="search-bar-input__submit"
        type="submit"
        :disabled="disableSubmit"
      >
        {{ t('search.buttonLabel') }}
      </b-button>
      <slot name="suggestions" />
    </template>
  </form-control-search>
</template>

<style lang="scss" scoped>
.search-bar-input:deep(.form-control-lg) {
  font-size: 1rem;
}
</style>
