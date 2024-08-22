<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { ICON_WEIGHT } from '@/enums/iconWeights'

const { t } = useI18n()

const label = t('buttonDownloadDocuments.label')
const iconLeftHoverWeight = ICON_WEIGHT.BOLD
const icon = 'download-simple'
</script>

<template>
  <button-icon
    class="button-download-documents"
    variant="link"
    :label="label"
    hide-label
    :icon-left="icon"
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
