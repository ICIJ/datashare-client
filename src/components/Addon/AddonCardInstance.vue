<script setup>
import { computed, ref } from 'vue'
import { camelCase, startCase } from 'lodash'
import { useI18n } from 'vue-i18n'

import AddonCard from '@/components/Addon/AddonCard'
import { useCore } from '@/composables/core'
import { ADDON_TYPE, addonTypeValidator } from '@/enums/addons'

const props = defineProps({
  addonType: { type: String, validator: addonTypeValidator },
  id: { type: String, required: true },
  name: { type: String, required: true },
  version: { type: String, required: true },
  description: { type: String },
  installed: { type: Boolean, default: false },
  deliverableFromRegistry: { type: Object, default: () => {} }
  /* id: 'plugin_01_id',
    name: 'Plugin 01 Registry Name',
    version: 'plugin_01_version',
    description: 'plugin_01_registry_description',
    homepage: 'plugin_01_registry_homepage' */
})
const emit = defineEmits(['installed', 'uninstalled'])
const { t } = useI18n()
const { toastedPromise, core } = useCore()
const isLoading = ref(false)
const deleteSuccess = computed(() => t(`${props.addonType}.deleteSuccess`))
const deleteError = computed(() => t(`${props.addonType}.deleteError`))
const submitSuccess = computed(() => t(`${props.addonType}.submitSuccess`))
const submitError = computed(() => t(`${props.addonType}.submitError`))

const isFromRegistry = computed(() => {
  return !!props.deliverableFromRegistry ?? false
})

const formattedName = computed(() => {
  if (isFromRegistry.value) {
    return props.deliverableFromRegistry?.name
  }
  return startCase(camelCase(props.name))
})
const addonDescription = computed(() =>
  isFromRegistry.value ? props.deliverableFromRegistry?.description : props.description
)
const recommendedVersion = computed(() => {
  return isFromRegistry.value ? props.deliverableFromRegistry?.version : props.version
})
const homepage = computed(() => props.deliverableFromRegistry?.homepage ?? null)

const addonInstallFn = computed(() => {
  return props.addonType === ADDON_TYPE.EXTENSION ? core.api.installExtensionFromId : core.api.installPluginFromId
})
const addonUninstallFn = computed(() => {
  return props.addonType === ADDON_TYPE.EXTENSION ? core.api.uninstallExtension : core.api.uninstallPlugin
})
async function install() {
  const toast = {
    successMessage: submitSuccess.value,
    errorMessage: submitError.value
  }
  isLoading.value = true
  try {
    const promise = addonInstallFn.value(props.id)
    await toastedPromise(promise, toast)
    emit('installed')
  } catch (e) {
  } finally {
    isLoading.value = false
  }
}
async function uninstall() {
  const toast = {
    successMessage: deleteSuccess.value,
    errorMessage: deleteError.value
  }
  isLoading.value = true
  try {
    const promise = addonUninstallFn.value(props.id)
    await toastedPromise(promise, toast)
    emit('uninstalled')
  } catch (e) {
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <addon-card
    :is-from-registry="isFromRegistry"
    :title="formattedName"
    :description="addonDescription"
    :url="homepage"
    :loading="isLoading"
    :installed="installed"
    :recommended-version="recommendedVersion"
    :version="version"
    @install="install"
    @uninstall="uninstall"
  ></addon-card>
</template>
