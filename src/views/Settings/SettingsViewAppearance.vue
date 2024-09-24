<script setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

import SettingsAppearanceRadioGroup from '@/components/Settings/SettingsAppearance/SettingsAppearanceRadioGroup'

defineProps({
  options: { type: Array, required: true }
})
const { t } = useI18n()
const infoLabel = t('settings.appearance.info')
const dismissInfoLabel = t('settings.appearance.dismissInfo')
const show = ref(true)
function closeAndSave() {
  console.warn('save settings in local storage')
  show.value = false
}
</script>

<template>
  <b-alert v-model="show" variant="info" dismissible close-class="close-class" class="d-flex align-items-center gap-2">
    {{ infoLabel }}
    <b-button variant="outline-info" class="bg-light-subtle" @click="closeAndSave">{{
      dismissInfoLabel
    }}</b-button></b-alert
  >
  <settings-appearance-radio-group :options="options" />
</template>
<style lang="scss">
.close-class {
  top: unset;
}
</style>
