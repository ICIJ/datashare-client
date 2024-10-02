<script setup>
import { useI18n } from 'vue-i18n'
import { ref, onBeforeMount, computed, watch } from 'vue'

import SettingsAppearanceRadioGroup from '@/components/Settings/SettingsAppearance/SettingsAppearanceRadioGroup'
import DismissableAlert from '@/components/Dismissable/DismissableAlert.vue'

defineOptions({ name: 'SettingsViewAppearance' })
onBeforeMount(() => {
  options.value = retrieveThemes()
})
const { t } = useI18n()
const infoLabel = computed(() => t('settings.appearance.info'))
const dismissInfoLabel = computed(() => t('settings.appearance.dismissInfo'))
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
      thumbnail: 'https://placehold.co/169x95'
    },
    {
      icon: 'moon',
      name: 'dark',
      label: 'Dark mode',
      thumbnail: 'https://placehold.co/169x95'
    }
  ]
}

const useTheme = (theme) => {
  const app = document.getElementById('app')
  app?.setAttribute('data-bs-theme', theme)
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
  <div class="settings-view-appearance">
    <dismissable-alert no-icon persist name="appearance" variant="info" :link-label="dismissInfoLabel">
      {{ infoLabel }}
    </dismissable-alert>

    <settings-appearance-radio-group v-model="selectedTheme" :options="options" />
  </div>
</template>
