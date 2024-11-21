<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
import { ICON_WEIGHT } from '@/enums/iconWeights'

const iconLeftHoverWeight = ICON_WEIGHT.BOLD
</script>

<template>
  <button-icon
    class="button-download-documents"
    variant="link"
    :label="$t('buttonDownloadDocuments.label')"
    hide-label
    :icon-left="PhDownloadSimple"
    :icon-left-hover-weight="iconLeftHoverWeight"
    :square="true"
  />
</template>

<style lang="scss">
.button-download-documents {
  &:hover,
  &:active {
    color: var(--bs-link-color);
  }
}
</style>
