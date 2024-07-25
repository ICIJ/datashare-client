<script setup>
import { computed, useSlots } from 'vue'

const slots = useSlots()

const props = defineProps({
  title: {
    type: String
  },
  value: {
    type: String
  }
})

const hasValue = computed(() => {
  return !!props.value || !!slots.default
})
</script>

<template>
  <section class="document-download-popover-section">
    <div v-if="title" class="document-download-popover-section__title pb-1 text-tertiary-emphasis fst-italic">
      {{ title }}
    </div>
    <div v-if="hasValue" class="document-download-popover-section__value text-primary-emphasis">
      <slot><span v-html="value"></span></slot>
    </div>
  </section>
</template>
