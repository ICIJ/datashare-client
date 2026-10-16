<script setup>
import { AppIcon } from '@icij/murmur'

defineProps({
  /**
   * Human-readable label for the row, announced to screen readers and shown in the icon tooltip.
   */
  title: {
    type: String
  },
  /**
   * Icon component or name, passed straight to AppIcon.
   */
  icon: {
    type: [String, Object, Array]
  },
  /**
   * Render the row without its leading icon.
   */
  hideIcon: {
    type: Boolean
  }
})
</script>

<template>
  <div class="card-properties-entry d-flex px-1 mb-2 text-secondary-emphasis">
    <div
      v-if="!hideIcon"
      v-b-tooltip.body
      class="card-properties-entry__icon above-stretched-link pe-2 flex-shrink-0"
      :title="title"
    >
      <app-icon
        size="1.25em"
        :name="icon"
      />
    </div>
    <span class="visually-hidden">{{ title }}:</span>
    <div class="card-properties-entry__value">
      <slot />
    </div>
  </div>
</template>
