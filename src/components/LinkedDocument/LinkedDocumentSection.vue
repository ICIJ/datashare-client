<template>
  <section class="linked-document-section">
    <p class="linked-document-section__title d-inline-flex gap-1 text-body-emphasis">
      <phosphor-icon :name="icon" />
      <slot name="title"> {{ documents.length }} {{ title }} </slot>
    </p>
    <div class="ms-4">
      <p>
        <slot name="description">{{ description }}</slot>
      </p>
      <div>
        <slot name="document-list" v-bind="{ documents }">
          <linked-document-list :documents="documents" />
        </slot>
        <button-icon icon-right="magnifying-glass" :label="searchLabel" @click="emitSearch" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { PhosphorIcon } from '@icij/murmur-next'

import ButtonIcon from '@/components/Button/ButtonIcon'
import LinkedDocumentList from '@/components/LinkedDocument/LinkedDocumentList'
defineOptions({
  name: 'LinkedDocumentSection'
})
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  documents: {
    type: Array
  }
})
const emit = defineEmits(['search-all'])
const { t } = useI18n()

const searchLabel = t('linkedDocumentList.searchAll')

function emitSearch() {
  emit('search-all')
}
</script>
<style lang="scss" scoped>
.linked-document-section {
  &__title {
    font-weight: 500;
  }
}
</style>
