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

<style lang="scss" scoped>
.filter-type-overlay {
  // The colored backdrop is the first absolute child of `.b-overlay` —
  // attach the blur there so it composes with the bg color above the
  // (mostly hidden) underlying content.
  :deep(.b-overlay > div:first-child) {
    backdrop-filter: blur(v-bind(blur));
  }
}
</style>
