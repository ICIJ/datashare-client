<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import IPhX from '~icons/ph/x'

const emit = defineEmits(['close'])
const { t } = useI18n()
</script>

<template>
  <button-icon
    class="filters-panel-toggler"
    variant="outline-dark"
    :icon-left="IPhX"
    @click="emit('close')"
  >
    <slot>
      {{ t('filtersPanelToggler.label') }}
    </slot>
  </button-icon>
</template>
