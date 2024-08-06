<script setup>
import NamedEntitySectionListEntry from './NamedEntitySectionListEntry'

defineProps({
  entries: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="d-flex flex-wrap gap-2">
    <slot v-bind="{ entries }">
      <named-entity-section-list-entry v-for="(namedEntity, i) in entries" :key="i" :named-entity="namedEntity" />
    </slot>
  </div>
</template>
