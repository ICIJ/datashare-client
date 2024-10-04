<script setup>
import { useI18n } from 'vue-i18n'
import { ref, onBeforeMount, computed, watch } from 'vue'

import themeLight from '@/assets/images/illustrations/theme-light.png'
import themeDark from '@/assets/images/illustrations/theme-dark.png'
import SettingsAppearanceRadioGroup from '@/components/Settings/SettingsAppearance/SettingsAppearanceRadioGroup'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'

defineOptions({ name: 'SettingsViewAppearance' })
onBeforeMount(() => {
  options.value = retrieveThemes()
})
const { t } = useI18n()
const infoLabel = computed(() => t('settings.appearance.info'))
const DEFAULT_THEME = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const LOCAL_STORAGE_KEY = 'data-bs-theme'

function getSelectedTheme() {
  return localStorage.getItem(LOCAL_STORAGE_KEY) || DEFAULT_THEME
}
const selectedTheme = ref(getSelectedTheme())
const options = ref([])

function retrieveThemes() {
  return [
    {
      icon: 'sun',
      name: DEFAULT_THEME,
      label: 'Light mode',
      thumbnail: themeLight
    },
    {
      icon: 'moon',
      name: 'dark',
      label: 'Dark mode',
      thumbnail: themeDark
    }
  ]
}

const useTheme = (theme) => {
  document.body?.setAttribute('data-bs-theme', theme)
}

const persistSelectedTheme = (theme) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, theme)
}

watch(
  () => selectedTheme.value,
  (theme) => {
    persistSelectedTheme(theme)
    useTheme(theme)
  },
  { immediate: true }
)
</script>

<template>
  <settings-view-layout info-name="appearance" :info-label="infoLabel">
    <settings-appearance-radio-group v-model="selectedTheme" :options="options" />
  </settings-view-layout>
</template>
