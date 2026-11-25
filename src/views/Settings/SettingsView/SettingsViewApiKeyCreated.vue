<script setup>
import { ref } from 'vue'
import { HapticCopy, ButtonIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import IPhCaretDown from '~icons/ph/caret-down'
import IPhCaretUp from '~icons/ph/caret-up'
import IPhSparkle from '~icons/ph/sparkle'

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
    <p class="mb-2">
      {{ t('settings.api.key.warning') }}
    </p>
    <div class="input-group">
      <input
        class="form-control font-monospace"
        readonly
        :value="apiKey"
      >
      <haptic-copy
        :text="apiKey"
        class="settings-view-api-key-created__copy btn-outline-action"
        :label="t('settings.api.key.copy')"
      />
    </div>
    <button-icon
      variant="link"
      size="sm"
      class="settings-view-api-key-created__mcp-toggle px-0 mt-2"
      :icon-left="IPhSparkle"
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

<style lang="scss" scoped>
.settings-view-api-key-created__copy {
  --bs-btn-border-color: #{$input-border-color};
}
</style>
