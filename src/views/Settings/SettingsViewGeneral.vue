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

defineOptions({ name: 'ServerSettings' })

const { isServer } = useUtils()
const { core, toast, wait } = useCore()
const store = useStore()
const { t } = useI18n()
const settings = reactive({})

onBeforeMount(async () => {
  wait.start('load server settings')
  Object.assign(settings, await store.dispatch('settings/getSettings'))
  wait.end('load server settings')
})

const noAccessLabel = computed(() => t('serverSettings.noAccess'))
const submitSuccessLabel = computed(() => t('serverSettings.submitSuccess'))
const submitErrorLabel = computed(() => t('serverSettings.submitError'))
async function onSubmit(newSettings) {
  try {
    await store.dispatch('settings/onSubmit', newSettings)
    core.config.merge(newSettings)
    Object.assign(settings, newSettings)
    toast.success(submitSuccessLabel)
  } catch (_) {
    toast.error(submitErrorLabel)
  }
}
</script>
<template>
  <div class="settings-general my-4">
    <v-wait v-if="!isServer" for="load server settings" class="">
      <template #waiting>
        <phosphor-icon icon="circle" spin></phosphor-icon>
      </template>
      <settings-general :settings="settings" class="card border-0 p-4" @submit.prevent="onSubmit" />
    </v-wait>
    <div v-else>
      <b-alert model-value variant="danger" show> {{ noAccessLabel }} </b-alert>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
