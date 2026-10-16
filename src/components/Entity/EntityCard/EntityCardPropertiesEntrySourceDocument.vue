<script setup>
import { computed } from 'vue'

import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'

import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'

const props = defineProps({
  entity: {
    type: Object
  },
  property: {
    type: String
  },
  /**
   * The elasticsearch index holding the source documents, i.e. the project name.
   */
  index: {
    type: String,
    required: true
  }
})

// ponytail: the mockup shows document titles, which the entities index does not hold. Resolving
// them means a second lookup against <project> for every id on screen. Showing the id is enough
// to navigate; add the lookup when the list view lands and can batch it.
const documentIds = computed(() => props.entity?.documentIds ?? [])
</script>

<template>
  <entity-card-properties-entry
    class="entity-card-properties-entry-source-document"
    :entity="entity"
    :property="property"
  >
    <template v-if="documentIds.length">
      <router-link-document
        v-for="id in documentIds"
        :id="id"
        :key="id"
        :index="index"
        :routing="id"
        class="entity-card-properties-entry-source-document__link d-block text-truncate"
      >
        {{ id }}
      </router-link-document>
    </template>
    <template v-else>
      &#8212;
    </template>
  </entity-card-properties-entry>
</template>
