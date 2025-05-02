<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

const { t } = useI18n()
</script>

<template>
  <button-icon class="button-to-top" :label="t('buttonToTop.label')" variant="action" :icon-right="PhArrowCircleUp" />
</template>
