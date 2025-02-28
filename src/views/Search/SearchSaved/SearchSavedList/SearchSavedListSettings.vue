<script setup>
import { noop } from 'lodash'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useUrlPageParam, useUrlParamWithStore, useUrlParamsWithStore } from '@/composables/url-params'
import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useViewSettings, SORT_ORDER_KEY, SORT_TYPE_KEY } from '@/composables/view-settings'
import { useAppStore } from '@/store/modules'

const { t } = useI18n()
const { sortByLabel, tSortByOption, perPageLabel } = useViewSettings(t)
const appStore = useAppStore()
const view = 'searchSavedList'

const page = useUrlPageParam()

const perPage = ref({
  label: perPageLabel('searchSaved.title'),
  type: 'radio',
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
  type: 'radio',
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
      value: ['creation_date', 'asc'],
      text: tSortByOption('creationDate', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.DATE)
    },
    {
      value: ['creation_date', 'desc'],
      text: tSortByOption('creationDate', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.DATE)
    }
  ]
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
  <page-settings title="Page settings" :hide="hide" :visible="visible" :placement="placement">
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
  </page-settings>
</template>
