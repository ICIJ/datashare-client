<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import PageHeader from '@/components/PageHeader/PageHeader'
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'
import PageContainer from '@/components/PageContainer/PageContainer'
const { t } = useI18n()
const tabs = computed(() => [
  { icon: 'list', title: t('settings.general.title'), name: 'settings.general' },
  { icon: 'moon', title: t('settings.appearance.title'), name: 'settings.appearance' },
  { icon: 'globe-hemisphere-west', title: t('settings.languages.title'), name: 'settings.languages' },
  { icon: 'monitor', title: t('settings.addons.plugins.title'), name: 'settings.plugins' },
  { icon: 'database', title: t('settings.addons.extensions.title'), name: 'settings.extensions' }
])
</script>

<template>
  <div class="settings-view">
    <page-header no-toggle-settings />
    <page-container fluid>
      <div class="bg-tertiary-subtle rounded-1 p-4">
        <tab-group-navigation class="mx-3" nowrap>
          <tab-group-navigation-entry v-for="tab in tabs" :key="tab.name" :icon="tab.icon" :to="{ name: tab.name }">
            {{ tab.title }}
          </tab-group-navigation-entry>
        </tab-group-navigation>
        <router-view />
      </div>
    </page-container>
  </div>
</template>

<style scoped lang="scss"></style>
