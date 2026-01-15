<script setup>
import { useModal } from 'bootstrap-vue-next'
import { AppIcon } from '@icij/murmur-next'

import { useDocument } from '@/composables/useDocument'
import DocumentDropdownReindexModal from '@/components/Document/DocumentDropdown/DocumentDropdownReindexModal'

const { document } = useDocument()
const { create } = useModal()

function showModal() {
  create({ component: DocumentDropdownReindexModal, document }).show()
}
</script>

<template>
  <b-dropdown-item-button @click="showModal()">
    <span class="d-flex align-items-center gap-2">
      <app-icon><i-ph-arrow-clockwise /></app-icon>
      Reindex this document
    </span>
  </b-dropdown-item-button>
</template>
