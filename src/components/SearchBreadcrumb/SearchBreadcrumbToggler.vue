<script setup>
import IconButton from '@/components/IconButton'

const emit = defineEmits(['close'])
</script>

<template>
  <icon-button
    class="search-breadcrumb-toggler"
    variant="action"
    :label="$t('searchBreadcrumbToggler.close')"
    hide-label
    icon-left="x"
    @click="emit('close')"
  >
    <slot>{{ $t('searchBreadcrumbToggler.close') }}</slot>
  </icon-button>
</template>
