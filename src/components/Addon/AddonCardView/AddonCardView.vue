<script setup>
import { computed } from 'vue'

import AddonCardViewActions from '@/components/Addon/AddonCardView/AddonCardViewActions'
import AddonCardViewDetails from '@/components/Addon/AddonCardView/AddonCardViewDetails'

const props = defineProps({
  title: { type: String, required: true },
  version: { type: String },
  installed: { type: Boolean },
  recommendedVersion: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String },
  loading: { type: Boolean }
})

const hasAvailableUpdate = computed(() => {
  return props.installed && props.version !== props.recommendedVersion
})
</script>

<template>
  <b-card class="addon-card-view border-light" body-class="d-flex gap-2">
    <addon-card-view-details :title="title" :url="url" :description="description" />
    <addon-card-view-actions
      :version="version"
      :recommended-version="recommendedVersion"
      :should-install="!installed"
      :should-update="hasAvailableUpdate"
      :loading="loading"
      @install="$emit('install')"
      @update="$emit('update')"
      @uninstall="$emit('uninstall')"
    />
  </b-card>
</template>
<style lang="scss" scoped>
.addon-card-view {
  flex: 1 0 360px;
}
</style>
