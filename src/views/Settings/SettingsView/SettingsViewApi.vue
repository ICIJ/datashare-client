<script setup>
import { whenever } from '@vueuse/core'
import { ref, computed } from 'vue'
import { AppIcon, HapticCopy, ButtonIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import IPhPlus from '~icons/ph/plus'
import IPhArrowClockwise from '~icons/ph/arrow-clockwise'
import IPhTrash from '~icons/ph/trash'

import AppModal from '@/components/AppModal/AppModal'
import DisplayHash from '@/components/Display/DisplayHash'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'
import { useCore } from '@/composables/useCore'
import { useAuth } from '@/composables/useAuth'
import { useConfirmModal } from '@/composables/useConfirmModal'

/**
 * A page to manage user's API keys.
 */
defineOptions({ name: 'SettingsViewApi' })

const hashedKey = ref(null)
const apiKey = ref(null)
const core = useCore()
const { username } = useAuth()
const { confirm } = useConfirmModal()
const { t } = useI18n()

const hasHashedKey = computed(() => !!hashedKey.value)
const showModal = computed(() => !!apiKey.value)

async function getHashedApiKey() {
  const result = await core.api.getApiKey(username.value)
  hashedKey.value = result.hashedKey
}

async function createApiKey() {
  const result = await core.api.createApiKey(username.value)
  apiKey.value = result.apiKey
  await getHashedApiKey()
}

async function removeApiKey() {
  await core.api.removeApiKey(username.value)
  hashedKey.value = null
}

async function confirmDeleteApiKey() {
  const description = t('settings.api.key.delete.description')

  if (await confirm({ description })) {
    removeApiKey()
  }
}

whenever(username, getHashedApiKey, { immediate: true })
</script>

<template>
  <settings-view-layout class="settings-view-api">
    <div
      v-if="!hasHashedKey"
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
        @click="createApiKey"
      >
        {{ t('settings.api.newApiKey') }}
      </button-icon>
    </div>
    <div
      v-else
      class="settings-view-api__show"
    >
      <p v-html="t('settings.api.description')" />
      <div class="d-flex border rounded align-items-center">
        <div class="d-inline-flex flex-column align-items-center gap-1 p-3">
          <app-icon><i-ph-key /></app-icon>
          <b-badge variant="dark">
            {{ t('settings.api.key.badge') }}
          </b-badge>
        </div>
        <div class="flex-grow-1 p-3">
          <i18n-t keypath="settings.api.key.hash">
            <template #hash>
              <display-hash
                class="settings-view-api__show__hash"
                :value="hashedKey"
              />
            </template>
          </i18n-t>
          <p class="text-secondary-emphasis m-0">
            {{ t('settings.api.key.unavailable') }}
          </p>
        </div>
        <div class="d-flex justify-content-end gap-1 p-3">
          <button-icon
            :icon-left="IPhArrowClockwise"
            icon-left-hover-weight="bold"
            hide-label
            square
            size="sm"
            variant="outline-secondary"
            class="border-0"
            :label="t('settings.api.key.regenerate')"
            @click="createApiKey"
          />
          <button-icon
            :icon-left="IPhTrash"
            icon-left-hover-weight="bold"
            hide-label
            square
            size="sm"
            variant="outline-secondary"
            class="settings-view-api__show__delete border-0"
            :label="t('settings.api.key.delete.button')"
            @click="confirmDeleteApiKey"
          />
        </div>
      </div>
    </div>
    <app-modal
      size="md"
      :title="t('settings.api.key.created')"
      :model-value="showModal"
      lazy
      ok-only
      ok-variant="action"
      @hidden="apiKey = null"
    >
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
    </app-modal>
  </settings-view-layout>
</template>

<style lang="scss" scoped>
.settings-view-api {
  &__create-key {
    text-align: center;
    margin: auto;
    max-width: $modal-md;
  }

  &__key {
    &__delete {
      margin-top: 0.5rem;
    }
  }
}
</style>
