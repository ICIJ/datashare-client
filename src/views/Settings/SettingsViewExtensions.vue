<script setup>
/**
 * A list of extensions for the frontend.
 */

import { onBeforeMount, ref } from 'vue'
import { uniqueId } from 'lodash'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/core'
import AddonUrlInput from '@/components/Addon/AddonUrlInput'

defineOptions({ name: 'SettingsViewExtensions' })

const { toastedPromise, core, wait } = useCore()

const loaderId = uniqueId('extensions-loader-')
const { t } = useI18n()
onBeforeMount(() => {
  return loadExtensions()
})

const addons = ref([])
const url = ref('')
const isLoading = ref(false)

async function installPluginFromUrl(urlToInstall) {
  isLoading.value = true
  try {
    const toast = {
      successMessage: t('plugins.submitSuccess'),
      errorMessage: t('plugins.submitError')
    }
    const promise = core.api.installPluginFromUrl(urlToInstall)
    await toastedPromise(promise, toast)
  } catch (e) {
  } finally {
    isLoading.value = false
    url.value = ''
  }
}

async function loadExtensions(searchTerm) {
  wait.start(loaderId)
  try {
    addons.value = await core.api.getExtensions(searchTerm)
  } catch (e) {
  } finally {
    wait.end(loaderId)
  }
}
</script>
<template>
  <div class="settings-view-extensions my-4">
    <addon-url-input v-model="url" :loading="isLoading" @install="installPluginFromUrl" />
    <v-wait :for="loaderId">
      <div class="row justify-content-around row-gap-4">
        <addon-card-extension
          v-for="(addon, index) in addons"
          :key="index"
          v-bind="addon"
          class="col-6"
          @installed="addon.installed = true"
          @uninstalled="addon.installed = false"
        /></div
    ></v-wait>
  </div>
</template>

<style scoped lang="scss"></style>
