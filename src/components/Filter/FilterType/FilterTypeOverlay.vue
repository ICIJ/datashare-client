<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  bgColor: {
    type: String,
    default: 'var(--bs-body-bg)'
  },
  opacity: {
    type: Number,
    default: 0.9
  },
  blur: {
    type: String,
    default: '4px'
  }
})
</script>

<template>
  <b-overlay
    :show="show"
    :bg-color="bgColor"
    :opacity="opacity"
    :blur="blur"
    no-center
    class="filter-type-overlay"
  >
    <template
      v-if="$slots.overlay"
      #overlay
    >
      <slot name="overlay" />
    </template>
    <slot />
  </b-overlay>
</template>
