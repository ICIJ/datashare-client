<script setup>
import { computed, toValue } from 'vue'
import { AppIcon } from '@icij/murmur-next'

import { useSearchProperties } from '@/composables/useSearchProperties'

const { items } = useSearchProperties()

const props = defineProps({
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

const display = computed(() => {
  return toValue(props.title ?? items[props.property].text ?? props.property)
})
</script>

<template>
  <div class="document-card-properties-entry d-flex px-1 mb-2 text-secondary-emphasis">
    <div
      v-if="!hideIcon"
      v-b-tooltip.body
      class="document-card-properties-entry__icon above-stretched-link pe-2 flex-shrink-0"
      :title="display"
    >
      <app-icon
        size="1em"
        :name="icon ?? items[property].icon ?? property"
      />
    </div>
    <span class="visually-hidden">{{ display }}:</span>
    <div class="document-card-properties-entry__value">
      <slot>{{ document[property] ?? '&#8212;' }}</slot>
    </div>
  </div>
</template>
