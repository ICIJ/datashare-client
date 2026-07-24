<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DropdownSelector from '@/components/DropdownSelector/DropdownSelector'
import settings from '@/utils/settings'

defineOptions({ name: 'FieldDropdownSelector' })

const modelValue = defineModel({ type: String, default: 'all' })

const props = defineProps({
  /**
   * Disable the dropdown toggler.
   */
  disabled: {
    type: Boolean
  },
  /**
   * Hide the caret in the toggler.
   */
  noCaret: {
    type: Boolean
  },
  /**
   * Teleport the menu to a different element.
   */
  teleportTo: {
    type: [String, Object],
    default: 'body'
  },
  /**
   * Disable teleporting the menu.
   */
  teleportDisabled: {
    type: Boolean
  },
  /**
   * Field keys to offer.
   */
  options: {
    type: Array,
    default: () => settings.searchFields.map(field => field.key)
  },
  /**
   * Translation path prefix for each field key.
   */
  optionsPath: {
    type: Array,
    default: () => ['search', 'field']
  }
})

const emit = defineEmits(['hidden', 'changed'])
const { t } = useI18n()

const optionsPathPrefix = computed(() => `${props.optionsPath.join('.')}.`)

// Translate a field key to its localized label.
const fieldLabel = key => t(`${optionsPathPrefix.value}${key}`)
</script>

<template>
  <dropdown-selector
    v-model="modelValue"
    class="field-dropdown-selector"
    :class="{ 'field-dropdown-selector--selected': modelValue !== 'all' }"
    placement="bottom-end"
    :disabled="disabled"
    :no-caret="noCaret"
    :options="options"
    :teleport-to="teleportTo"
    :teleport-disabled="teleportDisabled"
    @change="emit('changed', $event)"
    @hidden="emit('hidden', $event)"
  >
    <template #button-content>
      <span>{{ fieldLabel(modelValue) }}</span>
    </template>
    <template #item="{ option, toggle }">
      <span
        class="field-dropdown-selector__option px-3 d-block"
        @click="toggle($event)"
      >
        {{ fieldLabel(option) }}
      </span>
    </template>
  </dropdown-selector>
</template>

<style lang="scss" scoped>
.field-dropdown-selector {
  &--selected:deep(.dropdown-toggle):after {
    bottom: 1px;
    border: 2px solid $secondary;
    content: '';
    left: 0;
    position: absolute;
    right: 1px;
    top: 1px;
  }
}
</style>
