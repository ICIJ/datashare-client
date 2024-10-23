<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import { useSearchSettings } from '@/composables/search-settings'

const { propertiesLabel, propertiesIcon } = useSearchSettings()

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
  <div class="document-card-properties-entry d-flex px-1 mb-2 text-secondary-emphasis">
    <div v-if="!hideIcon" class="document-card-properties-entry__icon pe-2">
      <phosphor-icon :name="icon ?? propertiesIcon[property] ?? property" />
    </div>
    <span class="visually-hidden">{{ title ?? propertiesLabel[property] ?? property }}:</span>
    <div class="document-card-properties-entry__value">
      <slot>{{ document[property] }}</slot>
    </div>
  </div>
</template>
