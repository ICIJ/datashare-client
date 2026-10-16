<script setup>
import { computed, toValue } from 'vue'

import CardPropertiesEntry from '@/components/Card/CardPropertiesEntry'
import { useEntityProperties, entityPropertyValues } from '@/composables/useEntityProperties'

const props = defineProps({
  entity: {
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

const { item } = useEntityProperties()

const field = computed(() => item(props.property))
const display = computed(() => toValue(props.title ?? field.value.text ?? props.property))
const icon = computed(() => props.icon ?? field.value.icon)
const values = computed(() => entityPropertyValues(props.entity, props.property))
</script>

<template>
  <card-properties-entry
    class="entity-card-properties-entry"
    :title="display"
    :icon="icon"
    :hide-icon="hideIcon"
  >
    <slot>{{ values.length ? values.join(', ') : '&#8212;' }}</slot>
  </card-properties-entry>
</template>
