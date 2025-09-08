<script setup>
import { useI18n } from 'vue-i18n'

import DocumentCard from '@/components/Document/DocumentCard/DocumentCard.vue'

defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
</script>

<template>
  <b-alert
    v-if="document.parent"
    variant="info"
    show
  >
    <p>
      {{ t('documentDropdownReindexModalParent.alert') }}
    </p>
    <document-card
      class="bg-body border"
      :document="document.parent"
      :properties="['thumbnail', 'title', 'contentType', 'contentLength']"
      no-actions
    />
  </b-alert>
</template>
