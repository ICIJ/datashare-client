<script setup>
import { computed } from 'vue'

import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'

import { entityCaption } from '@/composables/useEntityProperties'
import { useStructuredEntityModelStore } from '@/store/modules/structuredEntityModel'

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

const modelStore = useStructuredEntityModelStore()

const caption = computed(() => entityCaption(props.entity, modelStore.type(props.entity?.entityType)))
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
