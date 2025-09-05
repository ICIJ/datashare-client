<script setup>
import { noop } from 'lodash'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { LAYOUTS } from '@/enums/layouts'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useAppStore, useSearchStore } from '@/store/modules'
import { useSearchProperties } from '@/composables/useSearchProperties'
import { useViewSettings, INPUT_CHECKBOX, INPUT_RADIO } from '@/composables/useViewSettings'

const { t } = useI18n()
const appStore = useAppStore()
const searchStore = useSearchStore()
const { tLayout } = useViewSettings(t)
const { propertiesOptions, sortByOptions } = useSearchProperties()
const VIEW = 'search'

const layout = ref({
  label: tLayout.label,
  type: INPUT_RADIO,
  open: true,
  modelValue: computed({
    get: () => appStore.getSettings(VIEW, 'layout'),
    set: layout => appStore.setSettings(VIEW, { layout })
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
    to: computed(() => {
      const name = VIEW
      const { toRouteQuery: query } = searchStore
      return { name, query }
    }),
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
  label: computed(() => t('viewSettings.sortBy.label')),
  type: INPUT_RADIO,
  open: true,
  options: sortByOptions,
  modelValue: useUrlParamsWithStore(['sort', 'order'], {
    to: computed(() => {
      const name = VIEW
      const { toRouteQuery: query } = searchStore
      return { name, query }
    }),
    get: () => appStore.getSettings(VIEW, 'orderBy'),
    set: (sort = '_score', order = 'desc') => appStore.setSettings(VIEW, { orderBy: [sort, order] })
  })
})

const properties = ref({
  label: computed(() => t('viewSettings.properties')),
  type: INPUT_CHECKBOX,
  open: true,
  options: propertiesOptions,
  modelValue: computed({
    get: () => appStore.getSettings(VIEW, 'properties'),
    set: properties => appStore.setSettings(VIEW, { properties })
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

function reset() {
  appStore.resetSettings(VIEW)
}
</script>

<template>
  <page-settings
    class="search-settings"
    :title="t('searchSettings.title')"
    :hide="hide"
    :visible="visible"
    :placement="placement"
    route="search"
    @reset="reset"
  >
    <page-settings-section
      v-model="sortBy.modelValue"
      v-model:open="sortBy.open"
      class="search-settings__section search-settings__section--sort-by"
      :type="sortBy.type"
      :options="sortBy.options"
      :label="sortBy.label"
    />
    <page-settings-section
      v-model="perPage.modelValue"
      v-model:open="perPage.open"
      class="search-settings__section search-settings__section--per-page"
      :type="perPage.type"
      :options="perPage.options"
      :label="perPage.label"
    />
    <page-settings-section
      v-model="layout.modelValue"
      v-model:open="layout.open"
      class="search-settings__section search-settings__section--layout"
      :type="layout.type"
      :options="layout.options"
      :label="layout.label"
    />
    <page-settings-section
      v-model="properties.modelValue"
      v-model:open="properties.open"
      class="search-settings__section search-settings__section--properties"
      :type="properties.type"
      :options="properties.options"
      :label="properties.label"
    />
  </page-settings>
</template>
