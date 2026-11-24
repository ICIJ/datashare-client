<script setup>
import { AppIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <app-icon
    spin
    role="status"
  >
    <i-ph-circle-notch />
    <span class="visually-hidden">{{ t('appSpinner.loading') }}</span>
  </app-icon>
</template>
