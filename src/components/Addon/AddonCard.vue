<script setup>
import { computed } from 'vue'

import AddonCardActions from '@/components/Addon/AddonCardActions'
import AddonCardDetails from '@/components/Addon/AddonCardDetails'

const props = defineProps({
  title: { type: String, required: true },
  version: { type: String },
  installed: { type: Boolean },
  recommendedVersion: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String }
})

const hasAvailableUpdate = computed(() => {
  return props.installed && props.version !== props.recommendedVersion
})
</script>

<template>
  <b-card class="addon-card border-light" body-class="d-flex flex-grow-1 justify-content-between gap-2 col-12">
    <addon-card-details :title="title" :url="url" :description="description" />
    <addon-card-actions
      :version="version"
      :recommended-version="recommendedVersion"
      :should-install="!installed"
      :should-update="hasAvailableUpdate"
      @install="$emit('install')"
      @update="$emit('update')"
      @uninstall="$emit('uninstall')"
    />
  </b-card>
</template>
<style lang="scss" scoped>
.addon-card {
  .addon-card-action {
    flex-basis: 170px;
  }
}
</style>
