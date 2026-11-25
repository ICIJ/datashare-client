<script setup>
import { whenever } from '@vueuse/core'
import { ref, computed } from 'vue'
import { AppIcon, HapticCopy, ButtonIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'
import get from 'lodash/get'

import IPhPlus from '~icons/ph/plus'
import IPhTrash from '~icons/ph/trash'

import AppModal from '@/components/AppModal/AppModal'
import DisplayHash from '@/components/Display/DisplayHash'
import DisplayDatetimeShort from '@/components/Display/DisplayDatetimeShort'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'
import SettingsViewApiMcp from '@/views/Settings/SettingsView/SettingsViewApiMcp'
import SettingsViewApiKeyForm from '@/views/Settings/SettingsView/SettingsViewApiKeyForm'
import { useCore } from '@/composables/useCore'
import { useAuth } from '@/composables/useAuth'
import { useConfirmModal } from '@/composables/useConfirmModal'
import { useToast } from '@/composables/useToast'

/**
 * A page to manage user's API keys.
 */
defineOptions({ name: 'SettingsViewApi' })

const keys = ref([])
const apiKey = ref(null)
const showModal = ref(false)
const creating = ref(false)
const core = useCore()
const { username } = useAuth()
const { confirm } = useConfirmModal()
const { t } = useI18n()
const { toast } = useToast()

const hasKeys = computed(() => keys.value.length > 0)
const modalTitle = computed(() => (apiKey.value ? t('settings.api.key.created') : t('settings.api.form.title')))

async function fetchApiKeys() {
  keys.value = await core.api.getApiKeys(username.value)
}

async function addApiKey(payload) {
  creating.value = true
  try {
    const result = await core.api.addApiKey(username.value, payload)
    apiKey.value = result.apiKey
  }
  catch (error) {
    const message = get(error, 'response.data.error') ?? t('settings.api.form.error')
    toast.error(message)
  }
  finally {
    creating.value = false
  }
}

function closeModal() {
  showModal.value = false
  apiKey.value = null
  fetchApiKeys()
}

async function removeApiKey(hashedKey) {
  await core.api.removeApiKeyByHash(username.value, hashedKey)
  await fetchApiKeys()
}

async function confirmDeleteApiKey(hashedKey) {
  const description = t('settings.api.key.delete.description')

  if (await confirm({ description })) {
    await removeApiKey(hashedKey)
  }
}

function isExpired({ expirationDate }) {
  return new Date(expirationDate) <= new Date()
}

const fields = computed(() => [
  { key: 'hashedKey', text: t('settings.api.key.fields.key') },
  { key: 'projects', text: t('settings.api.key.fields.projects') },
  { key: 'creationDate', text: t('settings.api.key.fields.created') },
  { key: 'expirationDate', text: t('settings.api.key.fields.expires') }
])

function rowClass(key) {
  return {
    'settings-view-api__key': true,
    'settings-view-api__key--expired': isExpired(key)
  }
}

function projectLabel(name) {
  return core.findProject(name)?.label ?? name
}

whenever(username, fetchApiKeys, { immediate: true })
</script>

<template>
  <settings-view-layout class="settings-view-api">
    <div
      v-if="!hasKeys"
      class="settings-view-api__create text-center"
    >
      <div class="mb-3">
        <app-icon size="3em">
          <i-ph-key />
        </app-icon>
      </div>
      <p v-html="t('settings.api.description')" />
      <button-icon
        variant="action"
        :icon-left="IPhPlus"
        class="settings-view-api__create__button"
        @click="showModal = true"
      >
        {{ t('settings.api.newApiKey') }}
      </button-icon>
    </div>
    <div
      v-else
      class="settings-view-api__show"
    >
      <div class="d-flex align-items-start gap-3 mb-3">
        <p
          class="flex-grow-1 m-0"
          v-html="t('settings.api.description')"
        />
        <button-icon
          variant="action"
          :icon-right="IPhPlus"
          class="settings-view-api__create__button flex-shrink-0"
          @click="showModal = true"
        >
          {{ t('settings.api.newApiKey') }}
        </button-icon>
      </div>
      <page-table-generic
        :items="keys"
        :fields="fields"
        :row-class="rowClass"
        primary-key="hashedKey"
      >
        <template #cell(hashedKey)="{ item }">
          <display-hash :value="item.hashedKey" />
        </template>
        <template #cell(projects)="{ item }">
          <div class="d-flex flex-wrap gap-1">
            <b-badge
              v-for="name in item.projects"
              :key="name"
            >
              {{ projectLabel(name) }}
            </b-badge>
            <b-badge
              v-if="!item.projects.length"
              variant="light"
            >
              {{ t('settings.api.key.allProjects') }}
            </b-badge>
          </div>
        </template>
        <template #cell(creationDate)="{ item }">
          <display-datetime-short :value="item.creationDate" />
        </template>
        <template #cell(expirationDate)="{ item }">
          <display-datetime-short :value="item.expirationDate" />
          <b-badge
            v-if="isExpired(item)"
            variant="danger"
            class="ms-2"
          >
            {{ t('settings.api.key.expired') }}
          </b-badge>
        </template>
        <template #row-actions="{ item }">
          <button-icon
            :icon-left="IPhTrash"
            icon-left-hover-weight="bold"
            hide-label
            square
            size="sm"
            variant="outline-secondary"
            class="settings-view-api__key__delete border-0"
            :label="t('settings.api.key.delete.button')"
            @click="confirmDeleteApiKey(item.hashedKey)"
          />
        </template>
      </page-table-generic>
    </div>
    <app-modal
      size="md"
      :title="modalTitle"
      :model-value="showModal"
      lazy
      no-footer
      @hidden="closeModal"
    >
      <settings-view-api-key-form
        v-if="!apiKey"
        :projects="core.projects"
        :max-lifetime="core.config.get('apiKeyMaxLifetime')"
        :busy="creating"
        @submit="addApiKey"
      />
      <template v-else>
        <p>{{ t('settings.api.key.warning') }}</p>
        <div class="input-group">
          <input
            class="form-control font-monospace."
            readonly
            :value="apiKey"
          >
          <haptic-copy
            :text="apiKey"
            class="btn-outline-action"
            :label="t('settings.api.key.copy')"
          />
        </div>
        <hr class="my-4">
        <settings-view-api-mcp :api-key="apiKey" />
      </template>
    </app-modal>
  </settings-view-layout>
</template>

<style lang="scss" scoped>
.settings-view-api :deep(.settings-view-api__key--expired) {
  --bs-table-color: var(--bs-tertiary-color);
}
</style>
