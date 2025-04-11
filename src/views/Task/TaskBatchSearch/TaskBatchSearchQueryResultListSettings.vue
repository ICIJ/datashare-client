<script setup>
import { noop } from 'lodash'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useBatchSearchResultProperties } from '@/composables/useBatchSearchResultProperties'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import { INPUT_CHECKBOX, INPUT_RADIO, useViewSettings } from '@/composables/useViewSettings'
import { useAppStore } from '@/store/modules'

const { t } = useI18n()
const appStore = useAppStore()
const settingsView = 'batchSearchResults'
const { propertiesOptions, sortByOptions } = useBatchSearchResultProperties()
const { perPageLabel } = useViewSettings()

const sortBy = ref({
  label: computed(() => t('viewSettings.sortBy.label')),
  type: INPUT_RADIO,
  open: true,
  options: sortByOptions,
  modelValue: useUrlParamsWithStore(['sort', 'order'], {
    get: () => appStore.getSettings(settingsView, 'orderBy'),
    set: (sort, order) => appStore.setSettings({ view: settingsView, orderBy: [sort, order] })
  })
})

const perPage = ref({
  label: perPageLabel('task.batch-search-results.show.title'),
  type: INPUT_RADIO,
  open: true,
  modelValue: useUrlParamWithStore('perPage', {
    transform: (value) => Math.max(10, parseInt(value)),
    get: () => appStore.getSettings(settingsView, 'perPage'),
    set: (perPage) => appStore.setSettings({ view: settingsView, perPage })
  }),
  options: [
    {
      value: 10
    },
    {
      value: 25
    },
    {
      value: 50
    },
    {
      value: 100
    }
  ]
})

const properties = ref({
  label: computed(() => t('viewSettings.properties')),
  type: INPUT_CHECKBOX,
  open: true,
  modelValue: computed({
    get: () => appStore.getSettings(settingsView, 'properties'),
    set: (properties) => appStore.setSettings({ view: settingsView, properties })
  }),
  options: propertiesOptions
})

defineProps({
  hide: {
    type: Function,
    default: noop
  },
  visible: {
    type: Boolean
  },
  placement: {
    type: String
  }
})
</script>

<template>
  <page-settings :hide="hide" :visible="visible" :placement="placement">
    <page-settings-section
      v-model="sortBy.modelValue"
      v-model:open="sortBy.open"
      :type="sortBy.type"
      :options="sortBy.options"
      :label="sortBy.label"
    />
    <page-settings-section
      v-model="perPage.modelValue"
      v-model:open="perPage.open"
      :type="perPage.type"
      :options="perPage.options"
      :label="perPage.label"
    />
    <page-settings-section
      v-model="properties.modelValue"
      v-model:open="properties.open"
      :type="properties.type"
      :options="properties.options"
      :label="properties.label"
    />
  </page-settings>
</template>
