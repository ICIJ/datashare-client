<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import PageHeader from '@/components/PageHeader/PageHeader'
import TabGroup from '@/components/TabGroup/TabGroup'
import TabGroupEntry from '@/components/TabGroup/TabGroupEntry'
const { t } = useI18n()
const tabs = computed(() => [
  { icon: 'list', title: t('settings.general.title'), name: 'settings.general' },
  { icon: 'moon', title: t('settings.appearance.title'), name: 'settings.appearance' },
  { icon: 'file-text', title: t('settings.document-processing.title'), name: 'settings.document-processing' },
  { icon: 'rocket-launch', title: t('settings.batch-tasks.title'), name: 'settings.batch-tasks' },
  { icon: 'monitor', title: t('settings.plugins.title'), name: 'settings.plugins' },
  { icon: 'database', title: t('settings.extensions.title'), name: 'settings.extensions' }
])
</script>

<template>
  <div class="settings-view">
    <page-header no-toggle-settings />
    <div class="p-4">
      <tab-group lazy class="bg-tertiary-subtle rounded-1 p-4" nav-class="px-4" content-class="p-4">
        <tab-group-entry
          v-for="tab in tabs"
          :key="tab.title"
          :icon="tab.icon"
          :title="tab.title"
          @click="$router.push({ name: tab.name })"
        >
          <router-view />
        </tab-group-entry>
      </tab-group>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
