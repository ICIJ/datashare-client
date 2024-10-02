<script setup>
import { computed, ref } from 'vue'
import { camelCase, startCase } from 'lodash'
import { useI18n } from 'vue-i18n'

import AddonCard from '@/components/Addon/AddonCard'
import { useCore } from '@/composables/core'

const props = defineProps({
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
const deleteSuccess = computed(() => t('extensions.deleteSuccess'))
const deleteError = computed(() => t('extensions.deleteError'))
const submitSuccess = computed(() => t('extensions.submitSuccess'))
const submitError = computed(() => t('extensions.submitError'))

const isFromRegistry = computed(() => {
  return !!props.deliverableFromRegistry ?? false
})

const formattedName = computed(() => {
  if (isFromRegistry.value) {
    return props.deliverableFromRegistry?.name
  }
  return startCase(camelCase(props.name))
})
const extensionDescription = computed(() =>
  isFromRegistry.value ? props.deliverableFromRegistry?.description : props.description
)
const recommendedVersion = computed(() => {
  return isFromRegistry.value ? props.deliverableFromRegistry?.version : props.version
})
const homepage = computed(() => props.deliverableFromRegistry?.homepage ?? null)

async function install() {
  const toast = {
    successMessage: submitSuccess.value,
    errorMessage: submitError.value
  }
  isLoading.value = true
  try {
    const promise = core.api.installExtensionFromId(props.id)
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
    const promise = core.api.uninstallExtension(props.id)
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
    :description="extensionDescription"
    :url="homepage"
    :loading="isLoading"
    :installed="installed"
    :recommended-version="recommendedVersion"
    :version="version"
    @install="install"
    @uninstall="uninstall"
  ></addon-card>
</template>
