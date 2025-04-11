<script setup>
import { noop } from 'lodash'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import { useUrlPageParam } from '@/composables/useUrlPageParam'
import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import {
  useViewSettings,
  SORT_ORDER_KEY,
  SORT_TYPE_KEY,
  INPUT_RADIO,
  INPUT_CHECKBOX
} from '@/composables/useViewSettings'
import { useAppStore } from '@/store/modules'
import { useSearchHistoryProperties } from '@/composables/useSearchHistoryProperties.js'

const { t } = useI18n()
const { sortByLabel, tSortByOption, perPageLabel } = useViewSettings(t)
const appStore = useAppStore()
const view = 'searchHistoryList'

const page = useUrlPageParam()

const { propertiesOptions } = useSearchHistoryProperties()
const perPage = ref({
  label: perPageLabel('searchHistoryList.title'),
  type: INPUT_RADIO,
  open: true,
  modelValue: useUrlParamWithStore('perPage', {
    transform: (value) => Math.max(10, parseInt(value)),
    get: () => appStore.getSettings(view, 'perPage'),
    set: (perPage) => {
      appStore.setSettings({ view, perPage })
      page.value = 1
    }
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
  label: sortByLabel,
  type: INPUT_RADIO,
  open: true,
  modelValue: useUrlParamsWithStore(['sort', 'order'], {
    get: () => appStore.getSettings(view, 'orderBy'),
    set: (sort, order) => {
      appStore.setSettings({ view, orderBy: [sort, order] })
      page.value = 1
    }
  }),
  options: [
    {
      value: ['name', 'asc'],
      text: tSortByOption('name', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.ALPHA)
    },
    {
      value: ['name', 'desc'],
      text: tSortByOption('name', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.ALPHA)
    },
    {
      value: ['modification_date', 'desc'],
      text: tSortByOption('visitDate', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.DATE)
    },
    {
      value: ['modification_date', 'asc'],
      text: tSortByOption('visitDate', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.DATE)
    }
  ]
})
const properties = ref({
  label: computed(() => t('viewSettings.properties')),
  type: INPUT_CHECKBOX,
  open: true,
  options: propertiesOptions,
  modelValue: computed({
    get: () => appStore.getSettings('searchHistoryList', 'properties'),
    set: (properties) => appStore.setSettings({ view: 'searchHistoryList', properties })
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
