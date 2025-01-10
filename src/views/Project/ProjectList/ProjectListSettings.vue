<script setup>
import { noop } from 'lodash'
import { ref } from 'vue'

import { LAYOUTS } from '@/enums/layouts'
import { useCore } from '@/composables/core'
import { useUrlParamWithStore, useUrlParamsWithStore } from '@/composables/url-params'
import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useViewSettings } from '@/composables/view-settings'

const { SORT_ORDER_KEY, SORT_TYPE_KEY, sortByLabel, tSortByOption, tLayout, perPageLabel } = useViewSettings()
const { core } = useCore()
const layout = ref({
  label: tLayout.label,
  type: 'radio',
  open: true,
  modelValue: useUrlParamWithStore('layout', {
    get: () => core?.store.getters['app/getSettings']('projectList', 'layout'),
    set: (layout) => core?.store.commit('app/setSettings', { view: 'projectList', layout })
  }),
  options: [
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
  label: perPageLabel('projectList.title'),
  type: 'radio',
  open: true,
  modelValue: useUrlParamWithStore('perPage', {
    transform: (value) => Math.max(10, parseInt(value)),
    get: () => core?.store.getters['app/getSettings']('projectList', 'perPage'),
    set: (perPage) => core?.store.commit('app/setSettings', { view: 'projectList', perPage })
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
    get: () => core?.store.getters['app/getSettings']('projectList', 'orderBy'),
    set: (sort, order) => core?.store.commit('app/setSettings', { view: 'projectList', orderBy: [sort, order] })
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
      value: ['updateDate', 'asc'],
      text: tSortByOption('updateDate', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.DATE)
    },
    {
      value: ['updateDate', 'desc'],
      text: tSortByOption('updateDate', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.DATE)
    },
    {
      value: ['documentsCount', 'asc'],
      text: tSortByOption('documentsCount', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.NUMBER)
    },
    {
      value: ['documentsCount', 'desc'],
      text: tSortByOption('documentsCount', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.NUMBER)
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
    <page-settings-section
      v-model="layout.modelValue"
      v-model:open="layout.open"
      :type="layout.type"
      :options="layout.options"
      :label="layout.label"
    />
  </page-settings>
</template>
