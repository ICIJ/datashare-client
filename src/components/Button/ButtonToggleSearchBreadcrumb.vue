<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
</script>

<template>
  <button-icon
    :label="$t('buttonToggleSearchBreadcrumb.label')"
    class="button-toggle-search-breadcrumb"
    hide-label
    icon-left-weight="fill"
    icon-left="path"
    square
    variant="outline-dark"
  />
</template>
