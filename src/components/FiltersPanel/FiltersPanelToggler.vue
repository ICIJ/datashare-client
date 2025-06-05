<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

const emit = defineEmits(['close'])
const { t } = useI18n()
</script>

<template>
  <button-icon class="filters-panel-toggler" variant="outline-dark" icon-left="x" @click="emit('close')">
    <slot>
      {{ t('filtersPanelToggler.label') }}
    </slot>
  </button-icon>
</template>
