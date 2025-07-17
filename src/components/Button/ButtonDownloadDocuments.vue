<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import { ICON_WEIGHT } from '@/enums/iconWeights'

const iconLeftHoverWeight = ICON_WEIGHT.BOLD
const { t } = useI18n()
</script>

<template>
  <button-icon
    class="button-download-documents"
    variant="link"
    :label="t('buttonDownloadDocuments.label')"
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
