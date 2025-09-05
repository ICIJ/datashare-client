<script setup>
import { computed, watch, toRef, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ary } from 'lodash'
import Fuse from 'fuse.js'
import { PhosphorIcon } from '@icij/murmur-next'

import AddonUrlInput from '@/components/Addon/AddonUrlInput'
import AddonCard from '@/components/Addon/AddonCard'
import AppWait from '@/components/AppWait/AppWait'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import { apiInstance as api } from '@/api/apiInstance'
import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'
import { ADDON_TYPE, addonTypeValidator } from '@/enums/addons'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'

const props = defineProps({ addonsType: { type: String, validator: addonTypeValidator } })

const { toastedPromise } = useCore()
const { waitFor, isLoading, loaderId } = useWait()
const { t } = useI18n()

const addons = ref([])
const url = ref('')
const error = ref(true)
const filterTerm = ref('')

const installFromUrl = waitFor(async (urlToInstall) => {
  const successMessage = t(`settings.addons.${props.addonType}.submitSuccess`)
  const errorMessage = t(`settings.addons.${props.addonType}.submitError`)
  const promise = installAddonFromUrlFn.value(urlToInstall)
  await toastedPromise(promise, { successMessage, errorMessage })
  url.value = ''
})

const infoLabel = computed(() => t(`settings.addons.${props.addonsType}.info`))
const errorLabel = computed(() => t(`settings.addons.${props.addonsType}.errorLabel`))
const searchPlaceholder = computed(() => t(`settings.addons.${props.addonsType}.searchPlaceholder`))
const noResultsLabel = computed(() => t('settings.layout.noResults', { query: filterTerm.value }))

const installAddonFromUrlFn = computed(() =>
  props.addonType === ADDON_TYPE.EXTENSION ? api.installExtensionFromUrl.bind(api) : api.installPluginFromUrl.bind(api)
)

const retrieveAddonsFn = computed(() =>
  props.addonsType === ADDON_TYPE.EXTENSION ? api.getExtensions.bind(api) : api.getPlugins.bind(api)
)

const loadAddons = waitFor(async (searchTerm) => {
  error.value = false
  try {
    addons.value = await retrieveAddonsFn.value(searchTerm)
  }
  catch {
    error.value = true
  }
})

watch(toRef(props, 'addonsType'), ary(loadAddons, 0), { immediate: true })

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
    return fuse.value.search(filterTerm.value).map(r => r.item)
  }
  return addons.value
})
</script>

<template>
  <settings-view-layout
    :info-name="addonsType"
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
    <div class="col-12 col-xl-8">
      <addon-url-input
        v-model="url"
        :loading="isLoading"
        @install="installFromUrl"
      />
    </div>
    <b-alert
      v-if="error"
      variant="danger"
      model-value
    >
      {{ errorLabel }}
    </b-alert>
    <app-wait
      :for="loaderId"
      class="row g-4"
    >
      <template #waiting>
        <phosphor-icon
          :name="PhCircleNotch"
          spin
          size="lg"
          class="ms-auto"
        />
      </template>
      <div
        v-for="addon in filteredAddons"
        :key="addon.id"
        class="col-12 col-xl-6 d-flex"
      >
        <addon-card
          :id="addon.id"
          :addon-type="addonsType"
          :name="addon.name ?? addon.id"
          :version="addon.version"
          :description="addon.description"
          :installed="addon.installed"
          :deliverable-from-registry="addon.deliverableFromRegistry"
          @installed="addon.installed = true"
          @uninstalled="addon.installed = false"
        />
      </div>
    </app-wait>
  </settings-view-layout>
</template>

<style scoped lang="scss"></style>
