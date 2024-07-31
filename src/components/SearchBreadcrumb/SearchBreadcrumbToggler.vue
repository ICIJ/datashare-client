<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

const emit = defineEmits(['close'])
</script>

<template>
  <button-icon
    class="search-breadcrumb-toggler"
    variant="action"
    :label="$t('searchBreadcrumbToggler.close')"
    hide-label
    icon-left="x"
    @click="emit('close')"
  >
    <slot>{{ $t('searchBreadcrumbToggler.close') }}</slot>
  </button-icon>
</template>
