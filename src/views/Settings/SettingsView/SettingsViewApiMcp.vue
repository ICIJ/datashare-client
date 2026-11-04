<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Api } from '@/api'
import TabGroup from '@/components/TabGroup/TabGroup'
import TabGroupEntry from '@/components/TabGroup/TabGroupEntry'
import SettingsViewApiMcpSnippet from '@/views/Settings/SettingsView/SettingsViewApiMcpSnippet'

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
const activeClient = ref('claude-code')

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
  { id: 'claude-code', name: 'Claude Code', snippet: claudeCodeSnippet.value, language: 'shell', hint: t('settings.api.mcp.terminal') },
  { id: 'codex', name: 'Codex', snippet: codexSnippet.value, language: 'toml', hint: t('settings.api.mcp.codex', { path: '~/.codex/config.toml' }) },
  { id: 'antigravity', name: 'Antigravity', snippet: antigravitySnippet.value, language: 'shell', hint: t('settings.api.mcp.terminal') }
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
    <tab-group v-model="activeClient">
      <tab-group-entry
        v-for="client in clients"
        :id="client.id"
        :key="client.id"
        :title="client.name"
      >
        <p class="mb-2">
          {{ client.hint }}
        </p>
        <settings-view-api-mcp-snippet
          :code="client.snippet"
          :language="client.language"
        />
      </tab-group-entry>
    </tab-group>
  </div>
</template>
