<script setup>
import { noop } from 'lodash'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { LAYOUTS } from '@/enums/layouts'
import { useCore } from '@/composables/core'
import { useUrlParamWithStore, useUrlParamsWithStore } from '@/composables/url-params'
import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import settings from '@/utils/settings'

const { core } = useCore()
const { t } = useI18n()

const layout = ref({
  label: computed(() => t('search.layout.title')),
  type: 'radio',
  open: true,
  modelValue: useUrlParamWithStore('layout', {
    get: () => core?.store.getters['app/getSettings']('search', 'layout'),
    set: (layout) => core?.store.commit('app/setSettings', { view: 'search', layout })
  }),
  options: [
    {
      value: LAYOUTS.LIST,
      text: computed(() => t('search.layout.list')),
      icon: 'list'
    },
    {
      value: LAYOUTS.GRID,
      text: computed(() => t('search.layout.grid')),
      icon: 'dots-nine'
    },
    {
      value: LAYOUTS.TABLE,
      text: computed(() => t('search.layout.table')),
      icon: 'table'
    }
  ]
})

const perPage = ref({
  label: computed(() => t('search.settings.resultsPerPage')),
  type: 'radio',
  open: true,
  modelValue: useUrlParamWithStore('perPage', {
    transform: (value) => Math.max(10, parseInt(value)),
    get: () => core?.store.getters['app/getSettings']('search', 'perPage'),
    set: (perPage) => core?.store.commit('app/setSettings', { view: 'search', perPage })
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
  label: computed(() => t('search.settings.sortBy')),
  type: 'radio',
  open: true,
  modelValue: useUrlParamsWithStore(['sort', 'order'], {
    get: () => core?.store.getters['app/getSettings']('search', 'orderBy'),
    set: (sort, order) => core?.store.commit('app/setSettings', { view: 'search', orderBy: [sort, order] })
  }),
  options: settings.searchSortFields.map(({ name, field, desc }) => {
    const value = [field, desc ? 'desc' : 'asc']
    const text = computed(() => t('search.results.sort.' + name))
    return { value, text }
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
  <page-settings title="Results settings" :hide="hide" :visible="visible" :placement="placement">
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
