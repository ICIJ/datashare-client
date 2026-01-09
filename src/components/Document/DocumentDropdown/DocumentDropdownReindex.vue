<script setup>
import { useModalController } from 'bootstrap-vue-next'
import { AppIcon } from '@icij/murmur-next'

import { useDocument } from '@/composables/useDocument'
import DocumentDropdownReindexModal from '@/components/Document/DocumentDropdown/DocumentDropdownReindexModal'

const { document } = useDocument()
const modalController = useModalController()

function showModal() {
  const component = DocumentDropdownReindexModal
  const props = { document }
  modalController.create({ component, props })
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
