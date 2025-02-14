<script setup>
/**
 * A list of extensions for the frontend.
 */

import { computed, onBeforeMount, ref } from 'vue'
import { uniqueId } from 'lodash'
import { useI18n } from 'vue-i18n'
import Fuse from 'fuse.js'
import { PhosphorIcon } from '@icij/murmur-next'

import { useCore } from '@/composables/core'
import AddonUrlInput from '@/components/Addon/AddonUrlInput'
import AddonCard from '@/components/Addon/AddonCard'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'
import { ADDONS_TYPE, addonsTypeValidator } from '@/enums/addons'

defineOptions({ name: 'SettingsViewAddons' })
const props = defineProps({ addonsType: { type: String, validator: addonsTypeValidator } })

const { toastedPromise, core, wait } = useCore()
const { t } = useI18n()

const loaderId = uniqueId(`${props.addonType}-loader-`)

const addons = ref([])
const url = ref('')
const isLoading = ref(false)
const error = ref(true)
const filterTerm = ref('')

onBeforeMount(() => {
  return loadAddons()
})

async function installFromUrl(urlToInstall) {
  isLoading.value = true
  try {
    const toast = {
      successMessage: t(`${props.addonType}.submitSuccess`),
      errorMessage: t(`${props.addonType}.submitError`)
    }
    const promise = installAddonFromUrlFn.value(urlToInstall)
    await toastedPromise(promise, toast)
  } catch (e) {
  } finally {
    isLoading.value = false
    url.value = ''
  }
}
const infoLabel = computed(() => t(`settings.addons.${props.addonsType}.info`))
const errorLabel = computed(() => t(`settings.addons.${props.addonsType}.errorLabel`))
const searchPlaceholder = computed(() => t(`settings.addons.${props.addonsType}.searchPlaceholder`))
const noResultsLabel = computed(() => t('settings.layout.noResults', { query: filterTerm.value }))

const installAddonFromUrlFn = computed(() =>
  props.addonType === ADDONS_TYPE.EXTENSIONS
    ? core.api.installExtensionFromUrl.bind(core.api)
    : core.api.installPluginFromUrl.bind(core.api)
)

const retrieveAddonsFn = computed(() =>
  props.addonsType === ADDONS_TYPE.EXTENSIONS
    ? core.api.getExtensions.bind(core.api)
    : core.api.getPlugins.bind(core.api)
)

async function loadAddons(searchTerm) {
  wait.start(loaderId)
  error.value = false
  try {
    addons.value = await retrieveAddonsFn.value(searchTerm)
  } catch (e) {
    error.value = true
  } finally {
    wait.end(loaderId)
  }
}

const fuse = computed(() => {
  const options = {
    includeScore: true,
    keys: ['deliverableFromRegistry.name', 'name'],
    shouldSort: true
  }
  return new Fuse(addons.value, options)
})

const noResults = computed(() => {
  return filteredAddons.value.length === 0
})

const filteredAddons = computed(() => {
  if (filterTerm.value.length > 0) {
    return fuse.value.search(filterTerm.value).map((r) => r.item)
  }
  return addons.value
})
</script>

<template>
  <settings-view-layout :info-name="addonsType" :info-label="infoLabel" :no-results="noResults">
    <template #filter>
      <form-control-search v-model="filterTerm" :placeholder="searchPlaceholder" clear-text />
    </template>
    <template #noResult>{{ noResultsLabel }}</template>
    <div class="col-12 col-xl-8">
      <addon-url-input v-model="url" :loading="isLoading" @install="installFromUrl" />
    </div>
    <b-alert v-if="error" variant="danger" model-value>{{ errorLabel }}</b-alert>
    <v-wait :for="loaderId" class="row g-4">
      <template #waiting>
        <phosphor-icon name="circle" spin size="lg" class="ms-auto"></phosphor-icon>
      </template>
      <div v-for="addon in filteredAddons" :key="addon.id" class="col-12 col-xl-6 d-flex">
        <addon-card
          :id="addon.id"
          addon-type="extension"
          :name="addon.name"
          :version="addon.version"
          :description="addon.description"
          :installed="addon.installed"
          :deliverable-from-registry="addon.deliverableFromRegistry"
          @installed="addon.installed = true"
          @uninstalled="addon.installed = false"
        />
      </div>
    </v-wait>
  </settings-view-layout>
</template>

<style scoped lang="scss"></style>
