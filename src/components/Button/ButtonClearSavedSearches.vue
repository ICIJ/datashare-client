<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
</script>

<template>
  <button-icon
    class="button-clear-saved-searches"
    variant="outline-primary"
    :label="$t('buttonClearSavedSearches.label')"
    :icon-left="PhTrash"
  />
</template>
