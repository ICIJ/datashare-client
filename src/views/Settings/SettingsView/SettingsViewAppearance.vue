<script setup>
import { ref, watch, toRef } from 'vue'

import { useTheme } from '@/composables/useTheme'
import SettingsAppearance from '@/components/Settings/SettingsAppearance/SettingsAppearance'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'

defineOptions({ name: 'SettingsViewAppearance' })

const { getTheme, setTheme, themes } = useTheme()
const selectedTheme = ref(getTheme())

watch(toRef(selectedTheme, 'value'), setTheme, { immediate: true })
</script>

<template>
  <settings-view-layout>
    <settings-appearance
      v-model="selectedTheme"
      :options="themes"
    />
  </settings-view-layout>
</template>
