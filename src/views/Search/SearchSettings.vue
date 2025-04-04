<script setup>
import { noop } from 'lodash'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { LAYOUTS } from '@/enums/layouts'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useAppStore } from '@/store/modules'
import { useSearchProperties } from '@/composables/useSearchProperties'
import { useViewSettings, INPUT_CHECKBOX, INPUT_RADIO } from '@/composables/useViewSettings'

const { t } = useI18n()
const appStore = useAppStore()
const { tLayout } = useViewSettings(t)
const { propertiesOptions, sortByOptions } = useSearchProperties()

const layout = ref({
  label: tLayout.label,
  type: INPUT_RADIO,
  open: true,
  modelValue: computed({
    get: () => appStore.getSettings('search', 'layout'),
    set: (layout) => appStore.setSettings({ view: 'search', layout })
  }),
  options: [
    {
      value: LAYOUTS.LIST,
      text: tLayout.list,
      icon: 'list'
    },
    {
      value: LAYOUTS.GRID,
      text: tLayout.grid,
      icon: 'dots-nine'
    },
    {
      value: LAYOUTS.TABLE,
      text: tLayout.table,
      icon: 'table'
    }
  ]
})

const perPage = ref({
  label: computed(() => t('search.settings.resultsPerPage')),
  type: INPUT_RADIO,
  open: true,
  modelValue: useUrlParamWithStore('perPage', {
    to: 'search',
    transform: (value) => Math.max(10, parseInt(value)),
    get: () => appStore.getSettings('search', 'perPage'),
    set: (perPage) => appStore.setSettings({ view: 'search', perPage })
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

const sortBy = ref({
  label: computed(() => t('viewSettings.sortBy.label')),
  type: INPUT_RADIO,
  open: true,
  options: sortByOptions,
  modelValue: useUrlParamsWithStore(['sort', 'order'], {
    to: 'search',
    get: () => appStore.getSettings('search', 'orderBy'),
    set: (sort, order) => appStore.setSettings({ view: 'search', orderBy: [sort, order] })
  })
})

const properties = ref({
  label: computed(() => t('viewSettings.properties')),
  type: INPUT_CHECKBOX,
  open: true,
  options: propertiesOptions,
  modelValue: computed({
    get: () => appStore.getSettings('search', 'properties'),
    set: (properties) => appStore.setSettings({ view: 'search', properties })
  })
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
  <page-settings
    :title="t('searchSettings.title')"
    :hide="hide"
    :visible="visible"
    :placement="placement"
    route="search"
  >
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
      v-model="layout.modelValue"
      v-model:open="layout.open"
      :type="layout.type"
      :options="layout.options"
      :label="layout.label"
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
