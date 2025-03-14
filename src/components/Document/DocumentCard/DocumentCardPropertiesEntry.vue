<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import { useSearchProperties } from '@/composables/search-properties'

const { items } = useSearchProperties()

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
    type: [String, Object, Array]
  },
  hideIcon: {
    type: Boolean
  }
})
</script>

<template>
  <div class="document-card-properties-entry d-flex px-1 mb-2 text-secondary-emphasis">
    <div v-if="!hideIcon" class="document-card-properties-entry__icon pe-2 flex-shrink-0">
      <phosphor-icon :name="icon ?? items[property].icon ?? property" />
    </div>
    <span class="visually-hidden">{{ title ?? items[property].text ?? property }}:</span>
    <div class="document-card-properties-entry__value">
      <slot>{{ document[property] }}</slot>
    </div>
  </div>
</template>
