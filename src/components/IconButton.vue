<template>
  <b-button v-bind="$attrs" class="d-flex align-items-center">
    <PhosphorIcon v-if="iconLeft" :name="iconLeft" />
    <v-slot
      ><span v-if="!hideLabel" :class="{ 'ps-1': iconLeft, 'pe-1': iconRight }">{{ label }}</span></v-slot
    >
    <PhosphorIcon v-if="iconRight" :name="iconRight" :class="{ 'mx-1': !hideLabel }" />
  </b-button>
</template>

<script setup>
import PhosphorIcon from '@/components/PhosphorIcon'

defineProps({
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
  }
})
</script>
