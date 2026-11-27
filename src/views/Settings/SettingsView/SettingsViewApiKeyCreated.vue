<script setup>
import { ref } from 'vue'
import { AppIcon, HapticCopy, ButtonIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import IPhCaretDown from '~icons/ph/caret-down'
import IPhCaretUp from '~icons/ph/caret-up'
import IPhSparkle from '~icons/ph/sparkle'

import DismissableAlert from '@/components/Dismissable/DismissableAlert'
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
    <p class="mb-3">
      {{ t('settings.api.key.warning') }}
      <strong>{{ t('settings.api.key.warningOnce') }}</strong>
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
    <dismissable-alert
      variant="info"
      no-close
      no-button
      class="settings-view-api-key-created__security mt-2 mb-4"
    >
      <template #icon="{ variant }">
        <app-icon :variant="variant">
          <i-ph-shield-check />
        </app-icon>
      </template>
      {{ t('settings.api.key.security') }}
      <a
        href="https://icij.gitbook.io/datashare/developers/api-keys"
        target="_blank"
      >{{ t('settings.api.key.securityLink') }}</a>
      ·
      <a
        href="https://icij.gitbook.io/datashare/developers/backend/api"
        target="_blank"
      >{{ t('settings.api.key.docs') }}</a>
    </dismissable-alert>
    <button-icon
      variant="link"
      size="sm"
      class="settings-view-api-key-created__mcp-toggle px-0"
      :icon-left="IPhSparkle"
      :icon-right="showMcp ? IPhCaretUp : IPhCaretDown"
      @click="showMcp = !showMcp"
    >
      {{ t('settings.api.mcp.toggle') }}
    </button-icon>
    <settings-view-api-mcp
      v-if="showMcp"
      :api-key="apiKey"
      class="mt-3 mb-2"
    />
  </div>
</template>

<style lang="scss" scoped>
.settings-view-api-key-created__copy {
  --bs-btn-border-color: #{$input-border-color};
}
</style>
