<script setup>
import I18nLocaleDropdown from '@/components/I18n/I18nLocaleDropdown'
</script>

<template>
  <span class="login-locale-dropdown-selector d-inline-flex gap-1 text-secondary-emphasis align-items-center">
    <span class="p-1">
      {{ $t('loginLocaleDropdownSelector.label') }}
    </span>
    <i18n-locale-dropdown class="p-1" popover-placement="top" />
  </span>
</template>
