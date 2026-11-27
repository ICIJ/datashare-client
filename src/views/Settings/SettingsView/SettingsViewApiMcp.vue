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
const promptApiKeySnippet = 'printf \'Datashare API key: \' && read -rs DATASHARE_API_KEY && echo'
const authorizationHeader = 'Authorization: Bearer $DATASHARE_API_KEY'
const claudeCodeSnippet = `claude mcp add --transport http datashare ${mcpUrl} --header "${authorizationHeader}"`
const antigravitySnippet = `agy mcp add --header "${authorizationHeader}" datashare ${mcpUrl}`

const codexSnippet = computed(() => {
  return [
    '[mcp_servers.datashare]',
    `url = "${mcpUrl}"`,
    `http_headers = { Authorization = "Bearer ${apiKey}" }`
  ].join('\n')
})

function shellSteps(snippet) {
  return [
    { hint: t('settings.api.mcp.promptApiKey'), snippet: promptApiKeySnippet, language: 'shell' },
    { hint: t('settings.api.mcp.connect'), snippet, language: 'shell' }
  ]
}

const clients = computed(() => [
  { id: 'claude-code', name: 'Claude Code', steps: shellSteps(claudeCodeSnippet) },
  { id: 'codex', name: 'Codex', steps: [{ hint: t('settings.api.mcp.codex', { path: '~/.codex/config.toml' }), snippet: codexSnippet.value, language: 'toml' }] },
  { id: 'antigravity', name: 'Antigravity', steps: shellSteps(antigravitySnippet) }
])
</script>

<template>
  <div class="settings-view-api__mcp">
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
        <template
          v-for="(step, index) in client.steps"
          :key="index"
        >
          <p
            class="mb-2"
            :class="index > 0 ? 'mt-4' : 'mt-3'"
          >
            {{ step.hint }}
          </p>
          <settings-view-api-mcp-snippet
            :code="step.snippet"
            :language="step.language"
          />
        </template>
      </tab-group-entry>
    </tab-group>
  </div>
</template>
