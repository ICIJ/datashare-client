<script setup>
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

defineOptions({ name: 'AppDropdownSearch' })

const modelValue = defineModel({ type: String, default: '' })

defineProps({
  /**
   * Whether the current query matches at least one option.
   */
  hasMatches: {
    type: Boolean,
    default: true
  },
  /**
   * Autofocus the input (used when the dropdown opens).
   */
  autofocus: {
    type: Boolean
  },
  /**
   * Placeholder for the search input.
   */
  placeholder: {
    type: String,
    default: null
  },
  /**
   * Message shown when no option matches the query.
   */
  noMatchesLabel: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['up', 'down', 'enter', 'blur'])
</script>

<template>
  <li class="app-dropdown-search">
    <div class="b-dropdown-form pt-1 mb-3">
      <form-control-search
        v-model="modelValue"
        :autofocus="autofocus"
        shadow
        :placeholder="placeholder"
        @blur="emit('blur', $event)"
        @up="emit('up', $event)"
        @down="emit('down', $event)"
        @enter="emit('enter', $event)"
      />
    </div>
    <div
      v-if="!hasMatches"
      class="text-center small text-muted pb-2"
    >
      {{ noMatchesLabel }}
    </div>
  </li>
</template>
