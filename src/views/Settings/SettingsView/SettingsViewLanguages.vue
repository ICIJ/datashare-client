<script setup>
/**
 * A list of settings for the language choosing.
 */

import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'
import { useLocale } from '@/composables/useLocale'
defineOptions({ name: 'SettingsViewLanguages' })
const { t } = useI18n()
const { currentLocale, setLocale, locales } = useLocale()
const translationHref = 'https://crowdin.com/project/datashare'
const infoLabel = computed(() => t('settings.languages.info', { href: translationHref }))
</script>
<template>
  <settings-view-layout
    class="settings-view-languages"
    info-name="languages"
    :info-label="infoLabel"
  >
    <b-form-radio-group
      :model-value="currentLocale.key"
      stacked
      :options="locales"
      value-field="key"
      text-field="label"
      @update:model-value="setLocale"
    />
  </settings-view-layout>
</template>

<style lang="scss">
.settings-view-languages {
  & .form-check {
    margin-bottom: 0.5em;
  }
}
</style>
