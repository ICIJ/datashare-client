<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'
</script>

<template>
  <div class="project-view">
    <page-header no-toggle-settings />
    <page-container fluid>
      <div class="bg-tertiary-subtle rounded-1 p-4">
        <tab-group-navigation>
          <tab-group-navigation-entry icon="chart-bar" :to="{ name: 'project.view.insights' }">
            {{ $t('projectView.nav.insights') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="tree-structure" disabled>
            {{ $t('projectView.nav.paths') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="polygon" disabled>
            {{ $t('projectView.nav.graph') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="circles-three-plus" disabled>
            {{ $t('projectView.nav.details') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="clock-counter-clockwise" disabled>
            {{ $t('projectView.nav.history') }}
          </tab-group-navigation-entry>
        </tab-group-navigation>
        <router-view keep-alive />
      </div>
    </page-container>
  </div>
</template>
