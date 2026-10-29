<script setup>
import { computed } from 'vue'
import uniq from 'lodash/uniq'

import EntityCardPropertiesEntry from './EntityCardPropertiesEntry'

import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'
import { entityPropertyValues, MAX_VALUES } from '@/composables/useEntityProperties'

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
//
// No `routing` is passed for the same reason: routing is the ROOT document id and the entities
// index carries none, so this component cannot know it. document.js falls back to `routing || id`,
// which is what an embedded document gets today either way. The same batched lookup can return
// `_routing` per id and fix it properly.
// Through the composable rather than off the entity, so a blank id cannot reach
// RouterLinkDocument's required `id` prop and resolve to a broken route. Deduped because a
// repeated id would collide on `:key`, even though the backend already folds them into a Set.
const documentIds = computed(() => uniq(entityPropertyValues(props.entity, 'documentIds')))

// vue-router treats an empty required param as missing and throws while resolving, so a project
// that yields no index cannot produce a document route at all. Show the ids as text rather than
// link them nowhere.
const linkable = computed(() => !!props.index)

// This component replaces the default slot of EntityCardPropertiesEntry, so the cap that slot
// applies does not reach it. An entity cited by hundreds of documents gets the same treatment as
// any other over-long row.
const shownIds = computed(() => documentIds.value.slice(0, MAX_VALUES))
const hiddenCount = computed(() => documentIds.value.length - shownIds.value.length)
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
        v-for="id in shownIds"
        :id="id"
        :key="id"
        :index="index"
        class="entity-card-properties-entry-source-document__link d-block text-truncate"
      >
        {{ id }}
      </router-link-document>
      <span
        v-if="hiddenCount"
        class="entity-card-properties-entry-source-document__more d-block text-secondary-emphasis"
        :title="documentIds.join(', ')"
      >+{{ hiddenCount }}</span>
    </template>
    <template v-else>
      <span
        v-for="id in shownIds"
        :key="id"
        class="entity-card-properties-entry-source-document__id d-block text-truncate"
      >
        {{ id }}
      </span>
      <span
        v-if="hiddenCount"
        class="entity-card-properties-entry-source-document__more d-block text-secondary-emphasis"
        :title="documentIds.join(', ')"
      >+{{ hiddenCount }}</span>
    </template>
  </entity-card-properties-entry>
</template>
