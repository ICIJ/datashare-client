<template>
  <section>
    <h2>
      <slot name="title">
        {{ title }}
      </slot>
    </h2>
    <p>
      <slot name="description" />
    </p>
    <slot name="document-list" v-bind="{ documents }">
      <linked-document-list height="" :documents="documents" />
    </slot>
    <icon-button :label="searchLabel" @click="emitSearch" />
  </section>
</template>
<script setup>
import { useI18n } from 'vue-i18n'

import IconButton from '@/components/IconButton'
import LinkedDocumentList from '@/components/LinkedDocument/LinkedDocumentList'
defineOptions({
  name: 'LinkedDocumentSection'
})
defineProps({
  title: {
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
