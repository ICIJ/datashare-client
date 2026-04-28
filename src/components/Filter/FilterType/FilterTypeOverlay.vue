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
    default: 0.95
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
      <div class="filter-type-overlay__wrapper">
        <slot name="overlay" />
      </div>
    </template>
    <slot />
  </b-overlay>
</template>

<style lang="scss" scoped>
.filter-type-overlay {
  &__wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacer-xs;
  }
}
</style>
