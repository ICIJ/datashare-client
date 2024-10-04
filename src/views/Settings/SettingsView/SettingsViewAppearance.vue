<script setup>
import { useI18n } from 'vue-i18n'
import { ref, computed, watch } from 'vue'

import SettingsAppearanceRadioGroup from '@/components/Settings/SettingsAppearance/SettingsAppearanceRadioGroup'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'
import { useTheme } from '@/composables/useTheme'

defineOptions({ name: 'SettingsViewAppearance' })
const { theme, setTheme, themes } = useTheme()
const { t } = useI18n()
const infoLabel = computed(() => t('settings.appearance.info'))
const selectedTheme = ref(theme)
const options = ref(themes)

watch(
  () => selectedTheme.value,
  (theme) => {
    setTheme(theme)
  },
  { immediate: true }
)
</script>

<template>
  <settings-view-layout info-name="appearance" :info-label="infoLabel">
    <settings-appearance-radio-group v-model="selectedTheme" :options="options" />
  </settings-view-layout>
</template>
