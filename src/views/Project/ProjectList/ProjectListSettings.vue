<script setup>
import { noop } from 'lodash'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhDotsNine from '~icons/ph/dots-nine'
import IPhTable from '~icons/ph/table'

import { LAYOUTS } from '@/enums/layouts'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useViewSettings, SORT_ORDER_KEY, SORT_TYPE_KEY, INPUT_RADIO } from '@/composables/useViewSettings'
import { useAppStore } from '@/store/modules'

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

const VIEW = 'projectList'

const { t } = useI18n()
const { sortByLabel, tSortByOption, tLayout, perPageLabel } = useViewSettings(t)
const appStore = useAppStore()

const layout = ref({
  label: tLayout.label,
  type: INPUT_RADIO,
  open: true,
  modelValue: useUrlParamWithStore('layout', {
    get: () => appStore.getSettings(VIEW, 'layout'),
    set: layout => appStore.setSettings(VIEW, { layout })
  }),
  options: [
    {
      value: LAYOUTS.GRID,
      text: tLayout.grid,
      icon: IPhDotsNine
    },
    {
      value: LAYOUTS.TABLE,
      text: tLayout.table,
      icon: IPhTable
    }
  ]
})

const perPage = ref({
  label: perPageLabel('projectList.title'),
  type: INPUT_RADIO,
  open: true,
  modelValue: useUrlParamWithStore('perPage', {
    transform: value => Math.max(10, parseInt(value)),
    get: () => appStore.getSettings(VIEW, 'perPage'),
    set: perPage => appStore.setSettings(VIEW, { perPage })
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
    get: () => appStore.getSettings(VIEW, 'orderBy'),
    set: (sort, order) => appStore.setSettings(VIEW, { orderBy: [sort, order] })
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
      value: ['updateDate', 'desc'],
      text: tSortByOption('updateDate', SORT_ORDER_KEY.DESC, SORT_TYPE_KEY.DATE)
    },
    {
      value: ['updateDate', 'asc'],
      text: tSortByOption('updateDate', SORT_ORDER_KEY.ASC, SORT_TYPE_KEY.DATE)
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

function reset() {
  appStore.resetSettings(VIEW)
}
</script>

<template>
  <page-settings
    :hide="hide"
    :visible="visible"
    :placement="placement"
    @reset="reset"
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
  </page-settings>
</template>
