<script setup>
import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'

import ProjectButton from '@/components/Project/ProjectButton'

defineProps({
  entity: {
    type: Object
  },
  property: {
    type: String
  },
  project: {
    type: [Object, String],
    required: true
  },
  // See EntityCardPropertiesEntry: declared so it does not fall through as a DOM attribute.
  index: {
    type: String,
    default: undefined
  }
})
</script>

<template>
  <entity-card-properties-entry
    class="entity-card-properties-entry-project"
    :entity="entity"
    :property="property"
    hide-icon
  >
    <project-button
      :project="project"
      no-link
      disabled
    />
  </entity-card-properties-entry>
</template>
