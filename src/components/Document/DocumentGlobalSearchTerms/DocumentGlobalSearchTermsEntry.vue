<script setup>
import { computed } from 'vue'

const { term } = defineProps({
  term: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const counter = computed(() => term.count || null)
const label = computed(() => term.label)
const isInMetadata = computed(() => term.count === 0 && term.metadata > 0)
const isInTags = computed(() => term.count === 0 && term.tags > 0)
</script>

<template>
  <button-icon class="document-global-search-terms-entry" variant="outline-light" :counter="counter">
    <span class="document-global-search-terms-entry__label">
      {{ label }}
    </span>
    <b-badge v-if="isInMetadata" class="document-global-search-terms-entry__metadata" variant="light">
      {{ $t('document.inMetadata') }}
    </b-badge>
    <b-badge v-else-if="isInTags" class="document-global-search-terms-entry__tags" variant="light">
      {{ $t('document.inTags') }}
    </b-badge>
  </button-icon>
</template>

<style lang="scss" scoped>
.document-global-search-terms-entry {
  &__metadata,
  &__tags {
    margin-left: $spacer-xs;
  }
}
</style>
