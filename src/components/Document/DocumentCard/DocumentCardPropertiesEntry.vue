<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

defineProps({
  document: {
    type: Object
  },
  property: {
    type: String
  },
  title: {
    type: String
  },
  icon: {
    type: String
  },
  hideIcon: {
    type: Boolean
  }
})
</script>

<template>
  <div class="document-card-properties-entry d-flex px-1 mb-2 text-tertiary-emphasis">
    <div v-if="!hideIcon" class="document-card-properties-entry__icon pe-2">
      <phosphor-icon :name="icon ?? property" />
    </div>
    <span class="visually-hidden">{{ title ?? property }}:</span>
    <div class="document-card-properties-entry__value">
      <slot>{{ document[property] }}</slot>
    </div>
  </div>
</template>
