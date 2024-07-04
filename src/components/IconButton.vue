<template>
  <b-button :to="to" v-bind="$attrs" class="icon-button d-inline-flex align-items-center px-2" :class="classList">
    <PhosphorIcon v-if="iconLeft" :name="iconLeft" />
    <v-slot
      ><span v-if="!hideLabel" :class="{ 'ps-1': iconLeft, 'pe-1': iconRight }">{{ label }}</span></v-slot
    >
    <PhosphorIcon v-if="iconRight" :name="iconRight" :class="{ 'mx-1': !hideLabel }" />
  </b-button>
</template>

<script setup>
import { computed } from 'vue'

import PhosphorIcon from '@/components/PhosphorIcon'

const props = defineProps({
  iconLeft: {
    type: String,
    default: null
  },
  iconRight: {
    type: String,
    default: null
  },
  hideLabel: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: null
  },
  square: {
    type: Boolean,
    default: false
  },
  to: {
    type: Object
  }
})

const classList = computed(() => ({
  'icon-button--square': props.square
}))
</script>

<style lang="scss" scoped>
.icon-button {
  &--square {
    padding: 0;
    align-items: center;
    justify-content: center;
    width: calc(#{$btn-line-height * $btn-font-size} + #{$btn-padding-y * 2} + #{$btn-border-width} * 2);
    height: calc(#{$btn-line-height * $btn-font-size} + #{$btn-padding-y * 2} + #{$btn-border-width} * 2);
  }

  &--square.btn-sm {
    width: calc(#{$btn-line-height * $btn-font-size-sm} + #{$btn-padding-y-sm * 2} + #{$btn-border-width} * 2);
    height: calc(#{$btn-line-height * $btn-font-size-sm} + #{$btn-padding-y-sm * 2} + #{$btn-border-width} * 2);
  }

  &--square.btn-lg {
    width: calc(#{$btn-line-height * $btn-font-size-lg} + #{$btn-padding-y-lg * 2} + #{$btn-border-width} * 2);
    height: calc(#{$btn-line-height * $btn-font-size-lg} + #{$btn-padding-y-lg * 2} + #{$btn-border-width} * 2);
  }
}
</style>
