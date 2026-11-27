<script setup>
import { computed } from 'vue'

import EntityCardProperties from './EntityCardProperties'

const props = defineProps({
  entity: {
    type: Object
  },
  /**
   * The project the entity belongs to, shown as a badge and used to resolve source documents.
   */
  project: {
    type: [Object, String],
    required: true
  },
  /**
   * The elasticsearch index holding the source documents. Defaults to the project name.
   */
  index: {
    type: String
  },
  properties: {
    type: Array,
    default: () => ['name', 'entityType', 'sourceDocument', 'model', 'project']
  },
  active: {
    type: Boolean
  },
  selected: {
    type: Boolean
  },
  /**
   * Reserved for the selection the diagram feature will need. The card reflects `selected` but
   * ships no checkbox yet.
   */
  selectMode: {
    type: Boolean,
    default: false
  }
})

// Never undefined: `index` is a required prop downstream and feeds RouterLinkDocument's route
// params, where undefined resolves to a broken document link rather than failing loudly.
const index = computed(() => {
  const fromProject = typeof props.project === 'string' ? props.project : props.project?.name
  return props.index ?? fromProject ?? ''
})

const classList = computed(() => ({
  'entity-card--active': props.active,
  'entity-card--select-mode': props.selectMode,
  'entity-card--selected': props.selectMode && props.selected
}))
</script>

<template>
  <div
    class="entity-card"
    :class="classList"
  >
    <entity-card-properties
      class="entity-card__properties"
      :entity="entity"
      :properties="properties"
      :project="project"
      :index="index"
    />
  </div>
</template>

<style lang="scss">
.entity-card {
  display: flex;
  gap: $spacer-sm;
  padding: $spacer;
  background: var(--bs-body);
  border-radius: var(--bs-border-radius);
  position: relative;

  &:hover {
    background: var(--bs-tertiary-bg-subtle);
  }

  &--selected:not(&--active) {
    box-shadow: 0 0 0 1px var(--bs-action-text-emphasis) inset;
  }

  &--active {
    box-shadow: 0 0 0 1px var(--bs-primary) inset;
  }

  &__properties {
    flex: 1;
  }
}
</style>
