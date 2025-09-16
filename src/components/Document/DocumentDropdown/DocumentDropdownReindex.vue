<script setup>
import { useModalController } from 'bootstrap-vue-next'

import DocumentDropdownReindexModal from '@/components/Document/DocumentDropdown/DocumentDropdownReindexModal'
import { useI18n } from 'vue-i18n'

const { document } = defineProps({
  document: {
    type: Object,
    required: true
  }
})
const { t } = useI18n()
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
      <phosphor-icon :name="PhArrowClockwise" />
      {{ t('documentDropdownReindexModal.title') }}
    </span>
  </b-dropdown-item-button>
</template>
