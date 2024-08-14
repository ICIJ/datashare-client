<script setup>
import LocalesMenu from '@/components/LocalesMenu'
</script>

<template>
  <span class="login-locale-dropdown-selector d-inline-flex gap-1 text-secondary-emphasis align-items-center">
    <span class="p-1">
      {{ $t('loginLocaleDropdownSelector.label') }}
    </span>
    <locales-menu class="p-1" popover-placement="top" />
  </span>
</template>
