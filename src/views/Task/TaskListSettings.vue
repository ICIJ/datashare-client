<script setup>
import { noop } from 'lodash'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useTaskSettings } from '@/composables/task-settings'
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

const router = useRouter()

const pageName = computed(() => router.currentRoute.value.name.split('.'))
const pageTitleKey = computed(() => router.currentRoute.value.meta.title)
const { perPage, sortBy, properties } = useTaskSettings(pageName.value[1])
const { t } = useI18n()
const title = computed(() => {
  const page = t(pageTitleKey.value)

  return t(`task.settingTitle`, { page })
})
</script>

<template>
  <page-settings :title="title" :hide="hide" :visible="visible" :placement="placement">
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
