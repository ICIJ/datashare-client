<script setup>
/**
 * A list of extensions for the frontend.
 */

import DismissableAlert from '@/components/Dismissable/DismissableAlert'

defineOptions({ name: 'SettingsViewLayout' })
defineProps({
  infoName: { type: String },
  infoLabel: { type: String },
  infoDismissLabel: { type: String }
})
</script>
<template>
  <div class="settings-view-layout d-flex flex-column gap-4">
    <div>
      <slot name="filter"> </slot>
    </div>
    <slot name="info" v-bind="{ infoDismissLabel, infoLabel, infoName }">
      <dismissable-alert variant="info" class="m-0" persist :name="infoName" :link-label="infoDismissLabel">
        {{ infoLabel }}</dismissable-alert
      ></slot
    >
    <b-card class="border-0 p-4 gap-4" body-class="d-flex flex-column gap-4">
      <slot></slot>
    </b-card>
  </div>
</template>
