<script setup>
import { noop } from 'lodash'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'

import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useTaskSettings } from '@/composables/useTaskSettings'

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
const pageName = ref(route.name.split('.').slice(1).shift())
const pageTitleKey = computed(() => route.meta.title)
const { t } = useI18n()
const { perPage, sortBy, properties, reset } = useTaskSettings(pageName.value)
const title = computed(() => t(`task.settingTitle`, { page: t(pageTitleKey.value) }))
</script>

<template>
  <page-settings
    :title="title"
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
      v-model="properties.modelValue"
      v-model:open="properties.open"
      :type="properties.type"
      :options="properties.options"
      :label="properties.label"
    />
  </page-settings>
</template>
