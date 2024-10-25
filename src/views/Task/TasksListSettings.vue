<script setup>
import { noop } from 'lodash'
import { ref } from 'vue'

import { useCore } from '@/composables/core'
import { useUrlParamWithStore, useUrlParamsWithStore } from '@/composables/url-params'
import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useSettingsI18n } from '@/composables/settings-i18n'

const { core } = useCore()
const { SORT_ORDER_KEY, SORT_TYPE_KEY, sortByLabel, tSortByOption, perPageLabel } = useSettingsI18n()
const settingName = 'taskList'
const perPage = ref({
  label: perPageLabel('tasks.title'),
  type: 'radio',
  open: true,
  modelValue: useUrlParamWithStore('perPage', {
    transform: (value) => Math.max(10, parseInt(value)),
    get: () => core?.store.getters['app/getSettings'](settingName, 'perPage'),
    set: (perPage) => core?.store.commit('app/setSettings', { view: settingName, perPage })
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
    get: () => core?.store.getters['app/getSettings'](settingName, 'orderBy'),
    set: (sort, order) => core?.store.commit('app/setSettings', { view: settingName, orderBy: [sort, order] })
  }),
  options: [
    {
      value: ['name', 'asc'],
      text: tSortByOption('name', SORT_ORDER_KEY.ASC)
    },
    {
      value: ['name', 'desc'],
      text: tSortByOption('name', SORT_ORDER_KEY.DESC)
    },
    {
      value: ['updateDate', 'asc'],
      text: tSortByOption('updateDate', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.DATE)
    },
    {
      value: ['updateDate', 'desc'],
      text: tSortByOption('updateDate', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.DATE)
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
