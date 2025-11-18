<script setup>
import { computed, onBeforeMount, reactive, ref } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'
import Fuse from 'fuse.js'

import AppWait from '@/components/AppWait/AppWait'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import SettingsGeneral from '@/components/Settings/SettingsGeneral/SettingsGeneral'
import { useCore } from '@/composables/useCore'
import { useToast } from '@/composables/useToast'
import { useWait } from '@/composables/useWait'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'

/**
 * A list of settings for the backend (only available in local mode).
 */
defineOptions({ name: 'SettingsViewGeneral' })

const core = useCore()
const { toastedPromise } = useToast()
const { waitFor, loaderId } = useWait()
const { t } = useI18n()

const settings = reactive({})
const filterTerm = ref('')

const infoLabel = computed(() => t(`settings.general.info`))
const searchPlaceholder = computed(() => t(`settings.general.searchPlaceholder`))
const noResultsLabel = computed(() => t('settings.layout.noResults', { query: filterTerm.value }))

const loadSettings = waitFor(async () => {
  Object.assign(settings, await core.api.getSettings())
})

const settingsArray = computed(() => {
  return Object.entries(settings).map(([key, value]) => ({ key, value }))
})

const fuse = computed(() => {
  const options = {
    keys: ['key', 'value'],
    shouldSort: true,
    threshold: 0.3
  }
  return new Fuse(settingsArray.value, options)
})

const filteredSettings = computed(() => {
  if (filterTerm.value.length > 0) {
    return fuse.value.search(filterTerm.value).reduce((acc, curr) => {
      acc[curr.item.key] = curr.item.value
      return acc
    }, {})
  }
  return settings
})

const noResults = computed(() => {
  return Object.keys(filteredSettings.value).length === 0
})

async function onSubmit(newSettings) {
  const successMessage = t('serverSettings.submitSuccess')
  const errorMessage = t('serverSettings.submitError')
  await toastedPromise(core.api.setSettings(newSettings), { successMessage, errorMessage })
  core.config.merge(newSettings)
  Object.assign(settings, newSettings)
}

onBeforeMount(loadSettings)
</script>

<template>
  <settings-view-layout
    info-name="general"
    :info-label="infoLabel"
    :no-results="noResults"
  >
    <template #filter>
      <form-control-search
        v-model="filterTerm"
        autofocus
        clear-text
        shadow
        :placeholder="searchPlaceholder"
      />
    </template>
    <template #noResult>
      {{ noResultsLabel }}
    </template>
    <app-wait
      v-if="!noResults"
      :for="loaderId"
    >
      <template #waiting>
        <phosphor-icon
          :name="PhCircleNotch"
          spin
          size="lg"
          class="ms-auto"
        />
      </template>
      <settings-general
        :settings="filteredSettings"
        class="card border-0"
        @save="onSubmit"
      />
    </app-wait>
  </settings-view-layout>
</template>
