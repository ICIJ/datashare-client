<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  shouldInstall: { type: Boolean },
  shouldUpdate: { type: Boolean },
  version: { type: String },
  recommendedVersion: { type: String, required: true }
})
const emit = defineEmits(['install', 'update', 'uninstall'])
const { t } = useI18n()

const versionLabel = t('addonCard.version', { v: props.version })
const installLabel = t('addonCard.install', { v: props.recommendedVersion })
const updateLabel = t('addonCard.update', { v: props.recommendedVersion })
const uninstallLabel = t('addonCard.uninstall')
const installAddon = () => {
  emit('install')
}
const updateAddon = () => {
  emit('update')
}
const uninstallAddon = () => {
  emit('uninstall')
}
</script>

<template>
  <div class="addon-card-actions d-flex flex-column align-items-end gap-2">
    <button-icon
      v-if="shouldInstall"
      icon-left="cloud-arrow-down"
      variant="action"
      class="flex-grow-0"
      @click="installAddon"
      >{{ installLabel }}</button-icon
    >
    <template v-else>
      <button-icon
        v-if="shouldUpdate"
        icon-left="arrows-clockwise"
        variant="action"
        class="flex-grow-0"
        @click="updateAddon"
        >{{ updateLabel }}</button-icon
      >
      <span v-if="version" class="addon-card-actions__text text-secondary-emphasis text-nowrap">{{
        versionLabel
      }}</span>
      <button-icon
        icon-left="trash"
        variant="outline-secondary"
        class="addon-card__uninstall"
        @click="uninstallAddon"
        >{{ uninstallLabel }}</button-icon
      >
    </template>
  </div>
</template>

<style scoped lang="scss">
.addon-card-actions {
  &__text {
    padding: $btn-padding-y $btn-padding-x;
  }
}
</style>
