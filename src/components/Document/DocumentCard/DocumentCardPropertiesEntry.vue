<script setup>
import { computed, toValue } from 'vue'

import CardPropertiesEntry from '@/components/Card/CardPropertiesEntry'
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

const field = computed(() => items[props.property] ?? {})
const display = computed(() => toValue(props.title ?? field.value.text ?? props.property))
const icon = computed(() => props.icon ?? field.value.icon ?? props.property)
</script>

<template>
  <card-properties-entry
    class="document-card-properties-entry"
    :title="display"
    :icon="icon"
    :hide-icon="hideIcon"
  >
    <slot>{{ document[property] ?? '&#8212;' }}</slot>
  </card-properties-entry>
</template>
