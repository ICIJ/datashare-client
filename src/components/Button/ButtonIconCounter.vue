<script setup>
import DisplayNumber from '@/components/Display/DisplayNumber'

defineProps({
  counter: {
    type: Number,
    default: null
  },
  variant: {
    type: String,
    default: 'secondary'
  }
})
</script>

<template>
  <b-badge v-if="counter != null" :variant="variant" class="button-icon-counter text-nowrap" pill>
    <display-number :value="counter" />
  </b-badge>
</template>

<style lang="scss">
.button-icon-counter {
  // Override negative top position done by
  // .badge when used inside a button.
  .btn &.badge {
    top: auto;
  }

  @each $variant, $value in $theme-colors {
    &.text-bg-outline-#{$variant} {
      border: var(--bs-#{$variant}-border-subtle) 1px solid;
      color: var(--bs-#{$variant}-text-emphasis);
      background: var(--bs-body-bg);
    }
  }
}
</style>
