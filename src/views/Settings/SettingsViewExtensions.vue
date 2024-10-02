<script setup>
/**
 * A list of extensions for the frontend.
 */

import { computed, onBeforeMount, ref } from 'vue'
import { uniqueId } from 'lodash'
import { useI18n } from 'vue-i18n'
import Fuse from 'fuse.js'

import { useCore } from '@/composables/core'
import AddonUrlInput from '@/components/Addon/AddonUrlInput'
import AddonCardExtension from '@/components/Addon/AddonCardExtension'
import SettingsViewLayout from '@/views/Settings/SettingsViewLayout'

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
const filterTerm = ref('')

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
const infoLabel = computed(() => t('settings.extensions.info'))
const dismissInfoLabel = computed(() => t('settings.layout.infoDismiss'))
const searchPlaceholder = computed(() => t('settings.extensions.searchPlaceholder'))

async function loadExtensions(searchTerm) {
  wait.start(loaderId)
  try {
    addons.value = await core.api.getExtensions(searchTerm)
  } catch (e) {
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

const filteredAddons = computed(() => {
  if (filterTerm.value.length > 0) {
    const res = fuse.value.search(filterTerm.value)
    return res.map((r) => r.item)
  }
  return addons.value
})
</script>
<template>
  <settings-view-layout info-name="extensions" :info-label="infoLabel" :dismiss-info-label="dismissInfoLabel">
    <template #filter
      ><form-control-search v-model="filterTerm" :placeholder="searchPlaceholder" clear-text
    /></template>
    <div class="col-8">
      <addon-url-input v-model="url" :loading="isLoading" @install="installPluginFromUrl" />
    </div>
    <div class="row g-4">
      <div v-for="addon in filteredAddons" :key="addon.id" class="col-12 col-xl-6 d-flex">
        <addon-card-extension
          :id="addon.id"
          :name="addon.name"
          :version="addon.version"
          :description="addon.description"
          :installed="addon.installed"
          :deliverable-from-registry="addon.deliverableFromRegistry"
          @installed="addon.installed = true"
          @uninstalled="addon.installed = false"
        />
      </div>
    </div>
  </settings-view-layout>
</template>

<style scoped lang="scss"></style>
