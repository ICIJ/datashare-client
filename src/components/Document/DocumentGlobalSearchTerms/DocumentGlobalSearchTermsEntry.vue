<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import SearchParameterQueryTerm from '@/components/Search/SearchParameter/SearchParameterQueryTerm'

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
const { t } = useI18n()

const counter = computed(() => term.count || null)
const label = computed(() => term.label)
const isInMetadata = computed(() => term.count === 0 && term.metadata > 0)
const isInTags = computed(() => term.count === 0 && term.tags > 0)
</script>

<template>
  <search-parameter-query-term
    class="document-global-search-terms-entry"
    no-icon
    no-x-icon
    :counter="counter"
    :query="label"
    color="var(--bs-primary)"
  >
    <span class="document-global-search-terms-entry__label">
      {{ label }}
    </span>
    <b-badge v-if="isInMetadata" class="document-global-search-terms-entry__metadata" variant="light">
      {{ t('document.inMetadata') }}
    </b-badge>
    <b-badge v-else-if="isInTags" class="document-global-search-terms-entry__tags" variant="light">
      {{ t('document.inTags') }}
    </b-badge>
  </search-parameter-query-term>
</template>

<style lang="scss" scoped>
.document-global-search-terms-entry {
  padding-block: 9px;

  &:hover {
    cursor: pointer;
  }

  &__metadata,
  &__tags {
    margin-left: $spacer-xs;
  }
}
</style>
