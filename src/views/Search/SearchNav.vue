<script setup>
import DocumentSearchNav from '@/components/Document/DocumentSearchNav/DocumentSearchNav'
import { useSearchNav } from '@/composables/useSearchNav'

const { isDocumentInPage, disabledPrevious, disabledNext, previous, next } = useSearchNav()
</script>

<template>
  <document-search-nav
    v-if="isDocumentInPage"
    :disabled-previous="disabledPrevious"
    :disabled-next="disabledNext"
    @previous="previous"
    @next="next"
  />
</template>
