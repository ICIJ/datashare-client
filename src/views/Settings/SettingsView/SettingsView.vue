<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import PageHeader from '@/components/PageHeader/PageHeader'
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'
import PageContainer from '@/components/PageContainer/PageContainer'
import { MODE_NAME } from '@/mode'
import { useMode } from '@/composables/mode'

const { t } = useI18n()
const { isMode } = useMode()

const tabs = computed(() => [
  {
    icon: 'list',
    title: t('settings.general.title'),
    name: 'settings.general',
    modes: [MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]
  },
  {
    icon: 'moon',
    title: t('settings.appearance.title'),
    name: 'settings.appearance',
    modes: Object.values(MODE_NAME)
  },
  {
    icon: 'globe-hemisphere-west',
    title: t('settings.languages.title'),
    name: 'settings.languages',
    modes: Object.values(MODE_NAME)
  },
  {
    icon: 'monitor',
    title: t('settings.addons.plugins.title'),
    name: 'settings.plugins',
    modes: [MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]
  },
  {
    icon: 'database',
    title: t('settings.addons.extensions.title'),
    name: 'settings.extensions',
    modes: [MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]
  }
])

const displayTabs = computed(() => tabs.value.filter((tab) => tab.modes.some(isMode)))
</script>

<template>
  <page-container fluid top class="settings-view">
    <page-header no-toggle-settings />
    <div class="bg-tertiary-subtle rounded-1 p-4">
      <tab-group-navigation class="mx-3" nowrap>
        <tab-group-navigation-entry
          v-for="tab in displayTabs"
          :key="tab.name"
          :icon="tab.icon"
          :to="{ name: tab.name }"
        >
          {{ tab.title }}
        </tab-group-navigation-entry>
      </tab-group-navigation>
      <router-view />
    </div>
  </page-container>
</template>

<style scoped lang="scss"></style>
