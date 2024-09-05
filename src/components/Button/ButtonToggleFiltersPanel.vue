<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
</script>

<template>
  <button-icon
    class="button-toggle-filters-panel"
    :label="$t('buttonToggleFiltersPanel.label')"
    icon-left="funnel"
    variant="outline-tertiary"
  />
</template>

<style lang="scss" scoped>
.button-toggle-filters-panel {
  --bs-btn-color: var(--bs-link-color);
}
</style>
