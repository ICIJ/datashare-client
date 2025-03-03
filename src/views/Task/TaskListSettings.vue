<script setup>
import { noop } from 'lodash'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { computed, watch, ref } from 'vue'

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

const route = useRoute()

const pageTitleKey = computed(() => route.meta.title)
const pageName = ref(route.name.split('.'))

const { perPage, sortBy, properties } = useTaskSettings(pageName.value[1])
watch(
  () => route,
  (newRoute) => {
    pageName.value = newRoute.name.split('.')
    const taskSettings = useTaskSettings(pageName.value[1])
    perPage.value = taskSettings.perPage.value
    sortBy.value = taskSettings.sortBy.value

    properties.value = taskSettings.properties.value
  },
  { immediate: true }
)
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
