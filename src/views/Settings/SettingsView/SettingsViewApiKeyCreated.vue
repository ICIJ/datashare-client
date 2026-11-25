<script setup>
import { ref } from 'vue'
import { HapticCopy, ButtonIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import IPhCaretDown from '~icons/ph/caret-down'
import IPhCaretUp from '~icons/ph/caret-up'

import SettingsViewApiMcp from '@/views/Settings/SettingsView/SettingsViewApiMcp'

/**
 * The secret of a freshly created API key, with the AI assistant setup folded below it.
 */
defineOptions({ name: 'SettingsViewApiKeyCreated' })

defineProps({
  /**
   * The API key in clear, as returned once by the backend
   */
  apiKey: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
const showMcp = ref(false)
</script>

<template>
  <div class="settings-view-api-key-created">
    <div class="input-group">
      <input
        class="form-control font-monospace"
        readonly
        :value="apiKey"
      >
      <haptic-copy
        :text="apiKey"
        class="btn-outline-action"
        :label="t('settings.api.key.copy')"
      />
    </div>
    <p class="small text-body-secondary mt-1 mb-2">
      {{ t('settings.api.key.warning') }}
    </p>
    <button-icon
      variant="link"
      size="sm"
      class="settings-view-api-key-created__mcp-toggle px-0"
      :icon-right="showMcp ? IPhCaretUp : IPhCaretDown"
      @click="showMcp = !showMcp"
    >
      {{ t('settings.api.mcp.toggle') }}
    </button-icon>
    <settings-view-api-mcp
      v-if="showMcp"
      :api-key="apiKey"
      class="mt-2"
    />
  </div>
</template>
