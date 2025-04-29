<script setup>
import { ref, watch } from 'vue'

import SettingsAppearanceRadioGroup from '@/components/Settings/SettingsAppearance/SettingsAppearanceRadioGroup'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'
import { useTheme } from '@/composables/useTheme'

defineOptions({ name: 'SettingsViewAppearance' })

const { getTheme, setTheme, themes } = useTheme()
const selectedTheme = ref(getTheme())

watch(
  () => selectedTheme.value,
  (theme) => {
    setTheme(theme)
  },
  { immediate: true }
)
</script>

<template>
  <settings-view-layout>
    <settings-appearance-radio-group v-model="selectedTheme" :options="themes" />
  </settings-view-layout>
</template>
