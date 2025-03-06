<script setup>
import { ref, computed, onMounted } from 'vue'
import { PhosphorIcon, HapticCopy } from '@icij/murmur-next'

import AppModal from '@/components/AppModal/AppModal'
import ButtonIcon from '@/components/Button/ButtonIcon'
import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'
import PageTable from '@/components/PageTable/PageTable'
import PageTableTh from '@/components/PageTable/PageTableTh'
import PageTableTdActions from '@/components/PageTable/PageTableTdActions'
import { useCore } from '@/composables/core'

/**
 * A page to manage user's API keys.
 */
defineOptions({ name: 'SettingsViewApi' })

const hashedKey = ref(null)
const apiKey = ref(null)
const { core } = useCore()

const hasHashedKey = computed(() => !!hashedKey.value)
const showModal = computed(() => !!apiKey.value)

async function getHashedApiKey() {
  const username = await core.auth.getUsername()
  const result = await core.api.getApiKey(username)
  hashedKey.value = result.hashedKey
}

async function createApiKey() {
  const username = await core.auth.getUsername()
  const result = await core.api.createApiKey(username)
  apiKey.value = result.apiKey
  await getHashedApiKey()
}

async function deleteApiKey() {
  const username = await core.auth.getUsername()
  await core.api.deleteApiKey(username)
  hashedKey.value = null
}

onMounted(getHashedApiKey)
</script>

<template>
  <settings-view-layout class="settings-view-api">
    <div v-if="!hasHashedKey" class="settings-view-api__create-key">
      <div class="mb-3">
        <phosphor-icon :name="PhKey" size="3em" />
      </div>
      <p v-html="$t('settings.api.key.why')" />
      <button-icon variant="action" :icon-left="PhPlus" @click="createApiKey">
        {{ $t('settings.api.newApiKey') }}
      </button-icon>
    </div>
    <div v-else>
      <p v-html="$t('settings.api.key.description')" />
      <page-table>
        <template #thead>
          <page-table-th label="Key" emphasis name="key" :icon="PhKey" />
          <page-table-th label="Description" hide-label name="description" />
          <page-table-th label="Actions" hide-label name="actions" />
        </template>
        <tr>
          <td>
            <span class="font-monospace">
              {{ hashedKey.slice(0, 7) }}
            </span>
          </td>
          <td class="text-secondary font-italic">
            {{ $t('settings.api.key.unavailable') }}
          </td>
          <page-table-td-actions>
            <button-icon
              :icon-left="PhArrowClockwise"
              icon-left-hover-weight="bold"
              hide-label
              square
              size="sm"
              variant="outline-secondary"
              class="border-0"
              :label="$t('settings.api.key.regenerate')"
              @click.prevent="createApiKey"
            />
            <button-icon
              :icon-left="PhTrash"
              icon-left-hover-weight="bold"
              hide-label
              square
              size="sm"
              variant="outline-secondary"
              class="border-0"
              :label="$t('settings.api.key.delete.button')"
              @click.prevent="deleteApiKey"
            />
          </page-table-td-actions>
        </tr>
      </page-table>
    </div>
    <app-modal
      size="md"
      :title="$t('settings.api.key.created')"
      :model-value="showModal"
      lazy
      ok-only
      ok-variant="action"
      @hidden="apiKey = null"
    >
      <p>{{ $t('settings.api.key.warning') }}</p>
      <div class="input-group">
        <input class="form-control font-monospace." readonly :value="apiKey" />
        <haptic-copy :text="apiKey" class="btn-outline-action" label="Copy" />
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
