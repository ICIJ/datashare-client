<script setup>
import { computed } from 'vue'

import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'

import { entityCaption } from '@/composables/useEntityProperties'

const props = defineProps({
  entity: {
    type: Object
  },
  property: {
    type: String
  },
  // See EntityCardPropertiesEntry: declared so they do not fall through as DOM attributes.
  project: {
    type: [Object, String],
    default: undefined
  },
  index: {
    type: String,
    default: undefined
  }
})

const caption = computed(() => entityCaption(props.entity))
</script>

<template>
  <entity-card-properties-entry
    class="entity-card-properties-entry-name"
    :entity="entity"
    :property="property"
  >
    <span class="entity-card-properties-entry-name__caption fw-bold text-body">{{ caption }}</span>
  </entity-card-properties-entry>
</template>
