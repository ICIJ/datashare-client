<script setup>
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
  <div class="project-view-overview-history">
    <empty-state :label="$t('global.building')" :image="appBuilding" :image-dark="appBuildingDark" />
  </div>
</template>
