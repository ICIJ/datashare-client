<script setup>
import { noop } from 'lodash'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useBatchSearchResultProperties } from '@/composables/batch-search-result-properties'
import { useUrlParamWithStore, useUrlParamsWithStore } from '@/composables/url-params'
import { useAppStore } from '@/store/modules'

const { t } = useI18n()
const appStore = useAppStore()
const { sortByOptions } = useBatchSearchResultProperties()

const perPage = ref({
  label: computed(() => t('search.settings.resultsPerPage')),
  type: 'radio',
  open: true,
  modelValue: useUrlParamWithStore('perPage', {
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
  type: 'radio',
  open: true,
  options: sortByOptions,
  modelValue: useUrlParamsWithStore(['sort', 'order'], {
    get: () => appStore.getSettings('search', 'orderBy'),
    set: (sort, order) => appStore.setSettings({ view: 'search', orderBy: [sort, order] })
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
  <page-settings :hide="hide" :visible="visible" :placement="placement" title="Page settings">
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
