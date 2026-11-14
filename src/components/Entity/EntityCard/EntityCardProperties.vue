<script setup>
import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'
import EntityCardPropertiesEntryName from './EntityCardPropertiesEntryName'
import EntityCardPropertiesEntryProject from './EntityCardPropertiesEntryProject'
import EntityCardPropertiesEntrySourceDocument from './EntityCardPropertiesEntrySourceDocument'

import { ENTITY_FIELD } from '@/composables/useEntityProperties'

// Keys needing their own rendering. Everything else, including every model property and the
// entity's own `entityType` and `model`, goes through the generic entry: an unmapped key is the
// normal case while the FollowTheMoney ontology stays server-side.
const entryComponents = {
  [ENTITY_FIELD.NAME]: EntityCardPropertiesEntryName,
  [ENTITY_FIELD.SOURCE_DOCUMENT]: EntityCardPropertiesEntrySourceDocument,
  [ENTITY_FIELD.PROJECT]: EntityCardPropertiesEntryProject
}

defineProps({
  entity: {
    type: Object
  },
  properties: {
    type: Array,
    default: () => []
  },
  project: {
    type: [Object, String],
    required: true
  },
  index: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="entity-card-properties text-break">
    <component
      :is="entryComponents[key] ?? EntityCardPropertiesEntry"
      v-for="key in properties"
      :key="key"
      :entity="entity"
      :property="key"
      :project="project"
      :index="index"
    />
  </div>
</template>
