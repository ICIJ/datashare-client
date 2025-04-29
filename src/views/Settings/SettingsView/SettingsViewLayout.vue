<script setup>
/**
 * A list of extensions for the frontend.
 */

import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import DismissableAlert from '@/components/Dismissable/DismissableAlert'

defineOptions({ name: 'SettingsViewLayout' })

const props = defineProps({
  infoName: {
    type: String
  },
  infoLabel: {
    type: String
  },
  infoDismissLabel: {
    type: String
  },
  noResults: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

const dismissLabel = computed(() => props.infoDismissLabel ?? t('settings.layout.infoDismiss'))
</script>

<template>
  <div class="settings-view-layout d-flex flex-column gap-4 px-2 py-4">
    <slot v-if="infoLabel" name="info" v-bind="{ infoDismissLabel, infoLabel, infoName }">
      <dismissable-alert variant="info" class="m-0" persist :name="infoName" :link-label="dismissLabel">
        <span v-html="infoLabel" />
      </dismissable-alert>
    </slot>
    <slot name="filter" />
    <b-card class="border-0 p-4" body-class="d-flex flex-column gap-4">
      <slot />
      <slot v-if="noResults" name="noResult" />
    </b-card>
  </div>
</template>
