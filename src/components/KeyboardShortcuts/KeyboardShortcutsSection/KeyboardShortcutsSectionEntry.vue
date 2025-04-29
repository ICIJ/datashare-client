<script setup>
import { computed } from 'vue'
import { isArray, trim } from 'lodash'

import KeyboardShortcutsSectionEntryKey from './KeyboardShortcutsSectionEntryKey'

import { getShortkeyOS } from '@/utils/utils'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  keys: {
    type: [String, Array],
    required: true
  },
  macKeys: {
    type: [String, Array]
  }
})

const allKeys = computed(() => {
  // Use macKeys if the OS is macOS and macKeys is provided.
  const keys = getShortkeyOS() === 'mac' && props.macKeys ? props.macKeys : props.keys
  return isArray(keys) ? keys : keys.split('+').map(trim)
})
</script>

<template>
  <div class="keyboard-shortcuts-section-entry d-flex gap-3 align-items-center py-2">
    <div class="keyboard-shortcuts-section-entry__label">
      <slot name="label">{{ label }}</slot>
    </div>
    <div class="keyboard-shortcuts-section-entry__keys d-flex gap-3 align-items-center text-nowrap flex-nowrap">
      <slot>
        <keyboard-shortcuts-section-entry-key v-for="(key, i) in allKeys" :key="i" :value="key" />
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.keyboard-shortcuts-section-entry {
  &__label {
    max-width: 290px;
    width: 100%;
  }
}
</style>
