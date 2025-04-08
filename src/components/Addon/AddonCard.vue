<script setup>
import { computed } from 'vue'
import { camelCase, startCase } from 'lodash'
import { useI18n } from 'vue-i18n'

import AddonCardView from '@/components/Addon/AddonCardView/AddonCardView'
import { apiInstance as api } from '@/api/apiInstance'
import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'
import { ADDON_TYPE, addonTypeValidator } from '@/enums/addons'

const props = defineProps({
  addonType: { type: String, validator: addonTypeValidator },
  id: { type: String, required: true },
  name: { type: String, required: true },
  version: { type: String, required: true },
  description: { type: String },
  installed: { type: Boolean, default: false },
  deliverableFromRegistry: { type: Object, default: () => {} }
})

const emit = defineEmits(['installed', 'uninstalled'])
const { t } = useI18n()
const { toastedPromise } = useCore()
const { waitFor, isLoading } = useWait()
const deleteSuccess = computed(() => t(`${props.addonType}.deleteSuccess`))
const deleteError = computed(() => t(`${props.addonType}.deleteError`))
const submitSuccess = computed(() => t(`${props.addonType}.submitSuccess`))
const submitError = computed(() => t(`${props.addonType}.submitError`))

const isFromRegistry = computed(() => {
  return !!props.deliverableFromRegistry
})

const formattedName = computed(() => {
  return props.deliverableFromRegistry?.name ?? startCase(camelCase(props.name))
})

const addonDescription = computed(() =>
  isFromRegistry.value ? props.deliverableFromRegistry?.description : props.description
)

const recommendedVersion = computed(() => {
  return isFromRegistry.value ? props.deliverableFromRegistry?.version : props.version
})

const homepage = computed(() => props.deliverableFromRegistry?.homepage ?? null)

const addonInstallFn = computed(() => {
  return props.addonType === ADDON_TYPE.EXTENSION ? api.installExtensionFromId : api.installPluginFromId
})

const addonUninstallFn = computed(() => {
  return props.addonType === ADDON_TYPE.EXTENSION ? api.uninstallExtension : api.uninstallPlugin
})

const install = waitFor(async () => {
  const successMessage = submitSuccess.value
  const errorMessage = submitError.value
  const toast = { successMessage, errorMessage }
  const promise = addonInstallFn.value.call(api, props.id)
  await toastedPromise(promise, toast)
  emit('installed')
})

const uninstall = waitFor(async () => {
  const successMessage = deleteSuccess.value
  const errorMessage = deleteError.value
  const toast = { successMessage, errorMessage }
  const promise = addonUninstallFn.value.call(api, props.id)
  await toastedPromise(promise, toast)
  emit('uninstalled')
})
</script>

<template>
  <addon-card-view
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
  />
</template>
