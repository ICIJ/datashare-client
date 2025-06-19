<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

const { t } = useI18n()
</script>

<template>
  <button-icon
    class="button-to-top rounded-pill"
    size="lg"
    :label="t('buttonToTop.label')"
    variant="primary"
    :icon-right="PhCaretUp"
    icon-right-weight="bold"
    hide-label
    square
  />
</template>

<style lang="scss" scoped>
.button-to-top {
  --bs-btn-opacity: 0.5;
  --bs-btn-color: var(--bs-white);
  --bs-btn-hover-color: var(--bs-btn-color);
  --bs-btn-active-color: var(--bs-btn-color);
  --bs-btn-hover-bg: var(--bs-btn-bg);
  --bs-btn-box-shadow: var(--bs-box-shadow-lg);

  opacity: var(--bs-btn-opacity);

  &:hover {
    --bs-btn-opacity: 1;
  }
}
</style>
