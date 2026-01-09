<template>
  <span class="page-settings-entry d-inline-flex">
    <app-icon
      v-if="icon"
      :name="icon"
      class="me-2"
    />
    {{ text }}
  </span>
</template>

<script setup>
import { AppIcon } from '@icij/murmur-next'

defineOptions({
  name: 'PageSettingsEntry'
})
defineProps({
  icon: {
    type: [String, Object, Array]
  },
  text: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: false
  }
})
</script>

<style lang="scss">
.page-settings-entry {
  :checked + label,
  &-checked {
    font-weight: bold;
  }
}
</style>
