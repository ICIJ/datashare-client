<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AddonCardActions from '@/components/Addon/AddonCardActions'
import AddonCardDetails from '@/components/Addon/AddonCardDetails'

const props = defineProps({
  title: { type: String, required: true },
  version: { type: String },
  recommendedVersion: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true }
})
const emit = defineEmits(['install', 'update', 'uninstall'])
const { t } = useI18n()

const shouldInstall = computed(() => {
  return props.version === null
})
const shouldUpdate = computed(() => {
  return props.version !== props.recommendedVersion
})
</script>

<template>
  <b-card class="addon-card border-light" body-class="d-flex justify-content-between gap-2 ">
    <addon-card-details :title="title" :url="url" :description="description" />
    <addon-card-actions
      :version="version"
      :recommended-version="recommendedVersion"
      :should-install="shouldInstall"
      :should-update="shouldUpdate"
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
