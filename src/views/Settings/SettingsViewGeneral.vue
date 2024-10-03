<script setup>
/**
 * A list of settings for the backend (only available in local mode).
 */
import { computed, onBeforeMount, reactive } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

import SettingsGeneral from '@/components/Settings/SettingsGeneral/SettingsGeneral'
import { useUtils } from '@/composables/utils'
import { useCore } from '@/composables/core'
import SettingsViewLayout from '@/views/Settings/SettingsViewLayout'

defineOptions({ name: 'SettingsViewGeneral' })

const { isServer } = useUtils()
const { core, toastedPromise, wait } = useCore()
const store = useStore()
const { t } = useI18n()
const settings = reactive({})

onBeforeMount(async () => {
  wait.start('load server settings')
  Object.assign(settings, await store.dispatch('settings/getSettings'))
  wait.end('load server settings')
})
const infoLabel = computed(() => t(`settings.general.info`))
const dismissInfoLabel = computed(() => t('settings.layout.infoDismiss'))

const noAccessLabel = computed(() => t('serverSettings.noAccess'))
const submitSuccessLabel = computed(() => t('serverSettings.submitSuccess'))
const submitErrorLabel = computed(() => t('serverSettings.submitError'))
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
  <settings-view-layout info-name="general" :info-label="infoLabel" :dismiss-info-label="dismissInfoLabel">
    <v-wait v-if="!isServer" for="load server settings" class="">
      <template #waiting>
        <phosphor-icon name="circle" spin></phosphor-icon>
      </template>
      <settings-general :settings="settings" class="card border-0" @submit.prevent="onSubmit" />
    </v-wait>
    <div v-else>
      <b-alert model-value variant="danger"> {{ noAccessLabel }} </b-alert>
    </div>
  </settings-view-layout>
</template>
