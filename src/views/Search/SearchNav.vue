<script setup>
import { inject } from 'vue'

import DocumentSearchNav from '@/components/Document/DocumentSearchNav/DocumentSearchNav'
import { useSearchNav } from '@/composables/useSearchNav'

const modal = inject('modal', false)
const { isDocumentInPage, disabledPrevious, disabledNext, previous, next } = useSearchNav()
</script>

<template>
  <document-search-nav
    v-if="isDocumentInPage && !modal"
    :disabled-previous="disabledPrevious"
    :disabled-next="disabledNext"
    @previous="previous"
    @next="next"
  />
</template>
