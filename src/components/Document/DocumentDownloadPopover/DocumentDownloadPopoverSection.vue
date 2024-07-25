<script setup>
defineProps({
  title: {
    type: String
  },
  value: {
    type: String
  }
})
</script>

<template>
  <section class="document-download-popover-section">
    <div class="document-download-popover-section__title pb-2 text-tertiary-emphasis fst-italic">
      {{ title }}
    </div>
    <div class="document-download-popover-section__value text-primary-emphasis">
      <slot><span v-html="value"></span></slot>
    </div>
  </section>
</template>
