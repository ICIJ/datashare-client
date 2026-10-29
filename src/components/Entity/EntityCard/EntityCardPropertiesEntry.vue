<script setup>
import { computed, toValue } from 'vue'

import CardPropertiesEntry from '@/components/Card/CardPropertiesEntry'
import { useEntityProperties, entityPropertyValues, MAX_VALUES } from '@/composables/useEntityProperties'

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
  },
  // Declared but unused: EntityCardProperties hands the same props to every row, and an
  // undeclared one falls through onto the root div as an attribute, where a project object
  // serialises to "[object Object]".
  project: {
    type: [Object, String],
    default: undefined
  },
  index: {
    type: String,
    default: undefined
  }
})

const { item } = useEntityProperties()

const field = computed(() => item(props.property))
const display = computed(() => toValue(props.title ?? field.value.text ?? props.property))
const icon = computed(() => props.icon ?? field.value.icon)
const values = computed(() => entityPropertyValues(props.entity, props.property))
const capped = computed(() => values.value.length > MAX_VALUES)
const shown = computed(() => {
  if (!values.value.length) {
    return null
  }
  const head = values.value.slice(0, MAX_VALUES).join(', ')
  return capped.value ? `${head}\u2026` : head
})
// Only when something is hidden: a tooltip repeating what is already on screen is noise.
const allValues = computed(() => (capped.value ? values.value.join(', ') : undefined))
</script>

<template>
  <card-properties-entry
    class="entity-card-properties-entry"
    :title="display"
    :icon="icon"
    :hide-icon="hideIcon"
  >
    <slot>
      <span
        class="entity-card-properties-entry__values"
        :title="allValues"
      >{{ shown ?? '&#8212;' }}</span>
      <!-- `title` is not reliably announced on a non-interactive element, so the hidden values
           are repeated for screen readers rather than left to the tooltip alone. -->
      <span
        v-if="allValues"
        class="visually-hidden"
      >{{ allValues }}</span>
    </slot>
  </card-properties-entry>
</template>
