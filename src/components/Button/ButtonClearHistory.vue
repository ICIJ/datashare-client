<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
</script>

<template>
  <button-icon
    class="button-clear-history"
    variant="outline-primary"
    :label="$t('buttonClearHistory.label')"
    :icon-left="PhTrash"
  />
</template>
