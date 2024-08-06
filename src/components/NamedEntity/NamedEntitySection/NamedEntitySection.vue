<script setup>
import NamedEntitySectionActions from './NamedEntitySectionActions'
import NamedEntitySectionList from './NamedEntitySectionList'
import NamedEntitySectionMore from './NamedEntitySectionMore'
import NamedEntitySectionTitle from './NamedEntitySectionTitle'

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
</script>

<template>
  <section class="named-entity-section d-flex flex-column align-items-start gap-3 pb-5">
    <div class="d-flex gap-3 align-items-center justify-content-between w-100">
      <named-entity-section-title class="text-nowrap text-truncate" :category="category" :count="count" />
      <named-entity-section-actions
        :category="category"
        @copy="$emit('copy', $event)"
        @download="$emit('download', $event)"
      />
    </div>
    <named-entity-section-list :entries="entries">
      <slot />
    </named-entity-section-list>
    <named-entity-section-more v-if="hasMore" :category="category" />
  </section>
</template>
