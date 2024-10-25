<script setup>
import { noop } from 'lodash'
import { computed, ref } from 'vue'

import { useCore } from '@/composables/core'
import { useUrlParamWithStore, useUrlParamsWithStore } from '@/composables/url-params'
import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useViewSettings } from '@/composables/view-settings'
import { useTaskSettings } from '@/composables/task-settings'

const { core } = useCore()
const { SORT_ORDER_KEY, SORT_TYPE_KEY, sortByLabel, tSortByOption, perPageLabel, visiblePropertiesLabel } =
  useViewSettings()
const settingName = 'taskList'
const perPage = ref({
  label: perPageLabel('task.title'),
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
      text: tSortByOption('name', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.ALPHA)
    },
    {
      value: ['name', 'desc'],
      text: tSortByOption('name', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.ALPHA)
    },
    {
      value: ['id', 'asc'],
      text: tSortByOption('id', SORT_ORDER_KEY.ASC)
    },
    {
      value: ['id', 'desc'],
      text: tSortByOption('id', SORT_ORDER_KEY.DESC)
    },
    {
      value: ['progress', 'asc'],
      text: tSortByOption('progress', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.QUANTITY)
    },
    {
      value: ['progress', 'desc'],
      text: tSortByOption('progress', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.QUANTITY)
    },
    {
      value: ['creationDate', 'asc'],
      text: tSortByOption('creationDate', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.DATE)
    },
    {
      value: ['creationDate', 'desc'],
      text: tSortByOption('creationDate', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.DATE)
    }
  ]
})
const { propertiesOrder, propertiesLabel, propertiesIcon } = useTaskSettings()

const properties = ref({
  label: visiblePropertiesLabel,
  type: 'checkbox',
  open: true,
  modelValue: computed({
    get: () => core?.store.getters['app/getSettings']('settingName', 'properties'),
    set: (properties) => core?.store.commit('app/setSettings', { view: 'search', properties })
  }),
  options: computed(() => {
    return propertiesOrder.map((value) => {
      const text = propertiesLabel.value[value]
      const icon = propertiesIcon[value]
      return { value, icon, text }
    })
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
      v-model="properties.modelValue"
      v-model:open="properties.open"
      :type="properties.type"
      :options="properties.options"
      :label="properties.label"
    />
  </page-settings>
</template>
