<script setup>
/**
 * A list of settings for the backend (only available in local mode).
 */
import { computed, onBeforeMount, reactive, ref } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Fuse from 'fuse.js'

import SettingsGeneral from '@/components/Settings/SettingsGeneral/SettingsGeneral'
import { useUtils } from '@/composables/utils'
import { useCore } from '@/composables/core'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'

defineOptions({ name: 'SettingsViewGeneral' })

const { core, toastedPromise, wait } = useCore()
const store = useStore()
const { t } = useI18n()
const { isServer } = useUtils()

const settings = reactive({})
const filterTerm = ref('')

onBeforeMount(() => {
  return loadSettings()
})

const infoLabel = computed(() => t(`settings.general.info`))
const searchPlaceholder = computed(() => t(`settings.general.searchPlaceholder`))

const noAccessLabel = computed(() => t('serverSettings.noAccess'))
const submitSuccessLabel = computed(() => t('serverSettings.submitSuccess'))
const submitErrorLabel = computed(() => t('serverSettings.submitError'))
const noResultsLabel = computed(() => t('settings.layout.noResults', { query: filterTerm.value }))

const loaderId = 'load server settings'

async function loadSettings() {
  wait.start(loaderId)
  Object.assign(settings, await store.dispatch('settings/getSettings'))
  wait.end(loaderId)
}
const settingsArray = computed(() => Object.keys(settings).map((s) => ({ key: s, value: settings[s] })))
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
  try {
    await toastedPromise(store.dispatch('settings/onSubmit', newSettings), {
      successMessage: submitSuccessLabel.value,
      errorMessage: submitErrorLabel.value
    })
    core.config.merge(newSettings)
    Object.assign(settings, newSettings)
  } catch (_) {}
}
</script>
<template>
  <settings-view-layout info-name="general" :info-label="infoLabel" :no-results="noResults">
    <template #filter
      ><form-control-search v-model="filterTerm" :placeholder="searchPlaceholder" clear-text
    /></template>
    <template #noResult>{{ noResultsLabel }}</template>
    <template v-if="!isServer">
      <v-wait v-if="!noResults" :for="loaderId">
        <template #waiting>
          <phosphor-icon name="circle" spin size="lg" class="ms-auto"></phosphor-icon>
        </template>
        <settings-general :settings="filteredSettings" class="card border-0" @submit.prevent="onSubmit" />
      </v-wait>
    </template>
    <div v-else>
      <b-alert model-value variant="danger"> {{ noAccessLabel }} </b-alert>
    </div>
  </settings-view-layout>
</template>
