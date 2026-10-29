<script setup>
import { computed } from 'vue'
import uniq from 'lodash/uniq'

import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'

import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'
import { entityPropertyValues } from '@/composables/useEntityProperties'

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
    default: ''
  },
  // See EntityCardPropertiesEntry: declared so it does not fall through as a DOM attribute.
  project: {
    type: [Object, String],
    default: undefined
  }
})

// ponytail: the mockup shows document titles, which the entities index does not hold. Resolving
// them means a second lookup against <project> for every id on screen. Showing the id is enough
// to navigate; add the lookup when the list view lands and can batch it.
// Through the composable rather than off the entity, so a blank id cannot reach
// RouterLinkDocument's required `id` prop and resolve to a broken route. Deduped because a
// repeated id would collide on `:key`, even though the backend already folds them into a Set.
const documentIds = computed(() => uniq(entityPropertyValues(props.entity, 'documentIds')))

// vue-router treats an empty required param as missing and throws while resolving, so a project
// that yields no index cannot produce a document route at all. Show the ids as text rather than
// link them nowhere.
const linkable = computed(() => !!props.index)
</script>

<template>
  <entity-card-properties-entry
    class="entity-card-properties-entry-source-document"
    :entity="entity"
    :property="property"
  >
    <template v-if="!documentIds.length">
      &#8212;
    </template>
    <template v-else-if="linkable">
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
      <span
        v-for="id in documentIds"
        :key="id"
        class="entity-card-properties-entry-source-document__id d-block text-truncate"
      >
        {{ id }}
      </span>
    </template>
  </entity-card-properties-entry>
</template>
