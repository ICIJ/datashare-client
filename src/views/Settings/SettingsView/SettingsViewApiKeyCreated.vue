<script setup>
import { ref } from 'vue'
import { AppIcon, HapticCopy, ButtonIcon } from '@icij/murmur'
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
    <b-alert
      model-value
      variant="info"
      class="settings-view-api-key-created__security d-flex align-items-center gap-3 mt-3 mb-0"
    >
      <app-icon size="1.5em">
        <i-ph-shield-check />
      </app-icon>
      <span>
        {{ t('settings.api.key.security') }}
        <a
          href="https://icij.gitbook.io/datashare/developers/api-keys"
          target="_blank"
          class="alert-link"
        >{{ t('settings.api.key.securityLink') }}</a>
        ·
        <a
          href="https://icij.gitbook.io/datashare/developers/backend/api"
          target="_blank"
          class="alert-link"
        >{{ t('settings.api.key.docs') }}</a>
      </span>
    </b-alert>
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
