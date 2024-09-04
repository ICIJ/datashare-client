<script setup>
import EntitySectionActions from './EntitySectionActions'
import EntitySectionList from './EntitySectionList'
import EntitySectionMore from './EntitySectionMore'
import EntitySectionTitle from './EntitySectionTitle'

defineProps({
  category: {
    type: String,
    required: true
  },
  entries: {
    type: Array,
    default: () => []
  },
  count: {
    type: Number,
    default: 0
  },
  hasMore: {
    type: Boolean
  }
})

const emit = defineEmits(['copy', 'download', 'more'])
</script>

<template>
  <section class="entity-section d-flex flex-column align-items-start gap-3 pb-5">
    <div class="d-flex gap-3 align-items-center justify-content-between w-100">
      <entity-section-title class="text-nowrap text-truncate" :category="category" :count="count" />
      <entity-section-actions :category="category" @copy="emit('copy', $event)" @download="emit('download', $event)" />
    </div>
    <entity-section-list :entries="entries">
      <slot />
    </entity-section-list>
    <entity-section-more v-if="hasMore" :category="category" @click="emit('more', $event)" />
  </section>
</template>
