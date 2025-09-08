<script setup>
import AppDropdown from '@/components/AppDropdown/AppDropdown'

import DocumentDropdownReindex from './DocumentDropdownReindex'

defineProps({
  document: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <app-dropdown>
    <document-dropdown-reindex :document="document" />
  </app-dropdown>
</template>
