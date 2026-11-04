<script setup>
import { computed } from 'vue'
import { HapticCopy } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import { Api } from '@/api'

/**
 * Snippets to connect AI assistants to Datashare MCP with a freshly created API key.
 */
defineOptions({ name: 'SettingsViewApiMcp' })

const { apiKey } = defineProps({
  /**
   * The API key to authenticate the assistant with
   */
  apiKey: {
    type: String,
    required: true
  }
})

const { t } = useI18n()

const mcpUrl = Api.getFullUrl('/api/mcp')
const authorizationHeader = computed(() => `Authorization: Bearer ${apiKey}`)

const claudeCodeSnippet = computed(() => {
  return `claude mcp add --transport http datashare ${mcpUrl} --header "${authorizationHeader.value}"`
})

const codexSnippet = computed(() => {
  return [
    '[mcp_servers.datashare]',
    `url = "${mcpUrl}"`,
    `http_headers = { Authorization = "Bearer ${apiKey}" }`
  ].join('\n')
})

const antigravitySnippet = computed(() => {
  return `agy mcp add --header "${authorizationHeader.value}" datashare ${mcpUrl}`
})

const clients = computed(() => [
  { name: 'Claude Code', snippet: claudeCodeSnippet.value, hint: t('settings.api.mcp.terminal') },
  { name: 'Codex', snippet: codexSnippet.value, hint: t('settings.api.mcp.codex', { path: '~/.codex/config.toml' }) },
  { name: 'Antigravity', snippet: antigravitySnippet.value, hint: t('settings.api.mcp.terminal') }
])
</script>

<template>
  <div class="settings-view-api__mcp">
    <h3 class="fs-6 fw-bold mb-1">
      {{ t('settings.api.mcp.title') }}
    </h3>
    <p class="text-secondary-emphasis">
      {{ t('settings.api.mcp.description') }}
      <a
        href="https://icij.gitbook.io/datashare/developers/mcp"
        target="_blank"
      >{{ t('settings.api.mcp.learnMore') }}</a>
    </p>
    <b-tabs>
      <b-tab
        v-for="client in clients"
        :key="client.name"
        :title="client.name"
        class="pt-3"
      >
        <p class="mb-2">
          {{ client.hint }}
        </p>
        <div class="position-relative">
          <pre class="settings-view-api__mcp__snippet bg-body-tertiary border rounded p-3 pe-5 m-0"><code>{{ client.snippet }}</code></pre>
          <haptic-copy
            :text="client.snippet"
            :label="t('settings.api.key.copy')"
            class="settings-view-api__mcp__copy btn-outline-action position-absolute top-0 end-0 m-2"
            hide-label
            size="sm"
          />
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<style lang="scss" scoped>
.settings-view-api__mcp__snippet {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
