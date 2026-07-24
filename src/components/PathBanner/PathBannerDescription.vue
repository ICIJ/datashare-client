<script setup>

import DismissableAlert from '@/components/Dismissable/DismissableAlert.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <dismissable-alert
    class="path-banner-description"
    aria-label="Path Banner Description"
    variant="info"
  >
    {{ t('projectViewEdit.pathBanners.description') }}
  </dismissable-alert>
</template>
