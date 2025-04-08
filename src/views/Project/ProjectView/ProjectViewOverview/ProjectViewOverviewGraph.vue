<script setup>
import ProjectViewOverviewWidgets from './ProjectViewOverviewWidgets'

import EmptyState from '@/components/EmptyState/EmptyState'
import appBuilding from '@/assets/images/illustrations/app-building.svg'
import appBuildingDark from '@/assets/images/illustrations/app-building-dark.svg'

defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <div class="project-view-overview-graph">
    <project-view-overview-widgets :name="name" section="graph">
      <template #empty>
        <empty-state :label="$t('global.building')" :image="appBuilding" :image-dark="appBuildingDark" />
      </template>
    </project-view-overview-widgets>
  </div>
</template>
