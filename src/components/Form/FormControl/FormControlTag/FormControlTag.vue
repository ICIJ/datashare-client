<script setup>
import { computed, ref, watch, useTemplateRef } from 'vue'
import { compact, every, identity, isFunction, escapeRegExp, get, trim } from 'lodash'

import FormControlTagInput from './FormControlTagInput'
import FormControlTagDropdown from './FormControlTagDropdown'

import { useActiveElement } from '@/composables/useActiveElement'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  inputValue: {
    type: String,
    default: ''
  },
  addButtonText: {
    type: String,
    default: null
  },
  addButtonSize: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: null
  },
  placeholderIcon: {
    type: [String, Object, Array],
    default: PhHash
  },
  size: {
    type: String,
    default: 'md'
  },
  separator: {
    type: [String, Array],
    default: () => [',', ';']
  },
  state: {
    type: Boolean,
    default: null
  },
  options: {
    type: Array
  },
  searchKeys: {
    type: Array,
    default: () => []
  },
  trackBy: {
    type: [String, Function],
    default: () => identity
  },
  noDuplicates: {
    type: Boolean
  },
  noCreate: {
    type: Boolean
  },
  noTags: {
    type: Boolean
  },
  noClear: {
    type: Boolean
  },
  noPlaceholderIcon: {
    type: Boolean
  }
})

// Those two variables are refs to the DOM elements
const element = ref(null)
const inputElement = useTemplateRef('inputElement')

const inputValueTrigger = ref('')
const showDropdown = ref(false)
const focusIndex = ref(-1)

const emit = defineEmits(['update:modelValue', 'update:inputValue', 'update:focusIndex', 'blur', 'focus'])

const separators = computed(() => {
  if (Array.isArray(props.separator)) {
    return props.separator
  }
  return props.separator.split('')
})

const escapedSeparators = computed(() => {
  return separators.value.map((separator) => escapeRegExp(separator))
})

const separatorsPattern = computed(() => {
  return new RegExp(escapedSeparators.value.join('|'), 'g')
})

const endWithSeparator = (tag) => {
  return separators.value.some((separator) => tag.endsWith(separator))
}
const focus = () => inputElement.value.focus()

const inputTag = (tag) => {
  focusIndex.value = -1
  inputValueTrigger.value = tag
  if (endWithSeparator(tag)) {
    return addTag(tag)
  }
}

const addTag = (tag) => {
  // Split the string using the combined pattern
  const tags = compact(tag.split(separatorsPattern.value).map(trim))
  // Stop if any of the given tag is invalid
  if (!every(tags, tagValidator)) {
    return
  }
  emit('update:modelValue', [...props.modelValue, ...tags])
  inputValueTrigger.value = ''
  focus()
}

const tagValidator = (tag) => {
  return tag.trim() !== '' && tagDuplicatesValidator(tag) && tagCreateValidator(tag)
}

const tagDuplicatesValidator = (tag) => {
  return !props.noDuplicates || !props.modelValue.includes(tag)
}

const tagCreateValidator = (tag) => {
  return !props.noCreate || props.options.map(getValue).includes(tag)
}

const removeTag = (tag) => {
  const modelValue = props.modelValue.filter((t) => t !== tag)
  emit('update:modelValue', modelValue)
  focus()
}

const removeLastTag = () => {
  if (!props.noTags && inputValueTrigger.value === '' && props.modelValue.length > 0) {
    const modelValue = props.modelValue.slice(0, -1)
    emit('update:modelValue', modelValue)
  }
}

const getValue = (option) => {
  if (isFunction(props.trackBy)) {
    return props.trackBy(option)
  }
  return get(option, props.trackBy)
}

const clear = () => {
  emit('update:modelValue', [])
  focus()
}

const classList = computed(() => {
  return {
    'form-control-tag--show-dropdown': showDropdown.value
  }
})
function onEsc() {
  if (showDropdown.value === true) {
    showDropdown.value = false
  } else {
    inputElement.value.blur()
  }
}
const inputValue = () => props.inputValue
watch(inputValue, (value) => (inputValueTrigger.value = value), { immediate: true })
watch(inputValueTrigger, (value) => emit('update:inputValue', value))
defineExpose({ focus })

watch(useActiveElement(), async (activeElement) => {
  showDropdown.value = showDropdown.value && element.value.contains(activeElement)
})

watch(focusIndex, (value) => {
  if (value === -1) {
    focus()
  } else {
    showDropdown.value = !!inputValueTrigger.value
  }
})
</script>

<template>
  <div ref="element" class="form-control-tag" :class="classList">
    <form-control-tag-input
      ref="inputElement"
      class="form-control-tag__input"
      :no-tags="noTags"
      :no-clear="noClear"
      :no-placeholder-icon="noPlaceholderIcon"
      :add-button-text="addButtonText"
      :add-button-size="addButtonSize"
      :placeholder="placeholder"
      :placeholder-icon="placeholderIcon"
      :size="size"
      :state="state"
      :model-value="modelValue"
      :input-value="inputValueTrigger"
      :disabled="!tagValidator(inputValueTrigger)"
      @clear="clear"
      @update:inputValue="inputTag($event)"
      @add-tag="addTag($event)"
      @remove-tag="removeTag($event)"
      @remove-last-tag="removeLastTag()"
      @keydown.down.prevent="focusIndex = 0"
      @keydown.esc="onEsc"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    >
      <!-- eslint-disable-next-line vue/no-template-shadow -->
      <template #tag="{ tag }">
        <slot name="tag" v-bind="{ tag, removeTag }" />
      </template>
    </form-control-tag-input>
    <form-control-tag-dropdown
      class="form-control-tag__dropdown"
      :options="options"
      :model-value="modelValue"
      :input-value="inputValueTrigger"
      :no-duplicates="noDuplicates"
      :show="showDropdown"
      :search-keys="searchKeys"
      :track-by="trackBy"
      :target="inputElement"
      :focus-index="focusIndex"
      @update:focusIndex="focusIndex = $event"
      @update:show="showDropdown = $event"
      @add-tag="addTag($event)"
      @keydown.esc="onEsc"
    />
  </div>
</template>

<style lang="scss">
.form-control-tag {
  filter: drop-shadow(0 1px 3px rgba($black, 0));

  &--show-dropdown {
    filter: drop-shadow(0 1px 3px rgba($black, 0.15));

    &:has(.form-control-tag-dropdown--bottom) .form-control-tag-input,
    &:has(.form-control-tag-dropdown--bottom-start) .form-control-tag-input,
    &:has(.form-control-tag-dropdown--bottom-end) .form-control-tag-input {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:has(.form-control-tag-dropdown--top) .form-control-tag-input,
    &:has(.form-control-tag-dropdown--top-start) .form-control-tag-input,
    &:has(.form-control-tag-dropdown--top-end) .form-control-tag-input {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
}
</style>
