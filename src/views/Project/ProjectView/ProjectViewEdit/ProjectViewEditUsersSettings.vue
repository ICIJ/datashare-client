<script setup>
import { noop } from 'lodash'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useViewSettings, INPUT_RADIO } from '@/composables/useViewSettings'
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

const VIEW = 'projectUsersList'

const { t } = useI18n()
const { fieldsToSortByOptions, sortByLabel, perPageLabel } = useViewSettings(t)
const appStore = useAppStore()

const fields = [
  { key: 'name', text: t('projectViewEdit.users.fields.name.label'), sortable: true },
  { key: 'role', text: t('projectViewEdit.users.fields.role.label'), sortable: true }
]

const sortBy = ref({
  label: sortByLabel,
  type: INPUT_RADIO,
  open: true,
  modelValue: useUrlParamsWithStore(['sort', 'order'], {
    get: () => appStore.getSettings(VIEW, 'orderBy'),
    set: (sort, order) => appStore.setSettings(VIEW, { orderBy: [sort, order] })
  }),
  options: fieldsToSortByOptions(fields)
})

const perPage = ref({
  label: perPageLabel('projectViewEdit.tabs.users'),
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
  </page-settings>
</template>
