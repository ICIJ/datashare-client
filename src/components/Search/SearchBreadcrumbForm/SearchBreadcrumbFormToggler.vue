<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'
const { t } = useI18n()
const emit = defineEmits(['close'])
</script>

<template>
  <button-icon
    class="search-breadcrumb-form-toggler flex-shrink-0"
    variant="action"
    :label="t('searchBreadcrumbFormToggler.close')"
    hide-label
    hide-tooltip
    square
    icon-left="x"
    @click="emit('close')"
  >
    <slot>{{ t('searchBreadcrumbFormToggler.close') }}</slot>
  </button-icon>
</template>
