<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <p class="batch-download-unavailable-alert text-muted small mb-0">
    {{ t('task.batch-download.list.unavailableAlert') }}
  </p>
</template>
