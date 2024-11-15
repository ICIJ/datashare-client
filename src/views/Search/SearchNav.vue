<script setup>
import DocumentSearchNav from '@/components/Document/DocumentSearchNav/DocumentSearchNav'
import { useSearchNav } from '@/composables/search-nav'

const { hasEntries, disabledPrevious, disabledNext, previous, next } = useSearchNav()
</script>

<template>
  <document-search-nav
    v-if="hasEntries"
    :disabled-previous="disabledPrevious"
    :disabled-next="disabledNext"
    @previous="previous"
    @next="next"
  />
</template>
