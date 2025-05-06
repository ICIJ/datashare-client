<template>
  <section class="linked-document-section-list">
    <div class="ms-3 d-flex flex-column flex-grow-1">
      <p class="linked-document-section-list__description">
        <slot name="description">{{ description }}</slot>
      </p>
      <div v-if="documents.length" class="d-flex flex-column flex-grow-1">
        <slot name="document-list" v-bind="{ documents }">
          <linked-document-list :documents="documents" />
        </slot>
        <div class="pt-2">
          <button-icon icon-right="magnifying-glass" variant="action" :to="toSearch">{{
            t('linkedDocumentSectionList.search')
          }}</button-icon>
        </div>
      </div>
      <div v-else class="text-secondary-emphasis">{{ t('linkedDocumentSectionList.empty') }}</div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import LinkedDocumentList from '@/components/LinkedDocument/LinkedDocumentList'
import ButtonIcon from '@/components/Button/ButtonIcon.vue'

defineOptions({
  name: 'LinkedDocumentSection'
})
defineProps({
  description: {
    type: String,
    required: true
  },
  documents: {
    type: Array
  },
  toSearch: {
    type: Object
  }
})
const { t } = useI18n()
</script>
<style lang="scss" scoped>
.linked-document-section-list {
  &__description {
    text-wrap: pretty;
  }
}
</style>
