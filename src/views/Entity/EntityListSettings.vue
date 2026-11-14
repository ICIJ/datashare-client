<script setup>
import noop from 'lodash/noop'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PageSettings from '@/components/PageSettings/PageSettings'
import PageSettingsSection from '@/components/PageSettings/PageSettingsSection'
import { useEntityProperties } from '@/composables/useEntityProperties'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import { useUrlPageParam } from '@/composables/useUrlPageParam'
import { useViewSettings, INPUT_RADIO } from '@/composables/useViewSettings'
import { useAppStore } from '@/store/modules'

const VIEW = 'entityList'

const { t } = useI18n()
const appStore = useAppStore()
const { sortByOptions } = useEntityProperties()
const { perPageLabel } = useViewSettings()

// No `to` on the bindings below, matching SearchHistoryListSettings: batchQueryParamUpdate keys
// its pending batch on the target route name, and mixing a named target with useUrlPageParam's
// unnamed one makes the second call cancel the first's queued update.
const page = useUrlPageParam()

// Bound to the sections' own events rather than to the model setters: those setters also run
// during the initial URL-to-store sync, which would throw away the page a deep link asked for.
// The event only fires when someone actually picks a value.
function resetPage() {
  page.value = 1
}

const sortBy = ref({
  label: computed(() => t('viewSettings.sortBy.label')),
  type: INPUT_RADIO,
  open: true,
  options: sortByOptions,
  modelValue: useUrlParamsWithStore(['sort', 'order'], {
    get: () => appStore.getSettings(VIEW, 'orderBy'),
    set: (sort = '_score', order = 'desc') => appStore.setSettings(VIEW, { orderBy: [sort, order] })
  })
})

const perPage = ref({
  label: perPageLabel,
  type: INPUT_RADIO,
  open: true,
  modelValue: useUrlParamWithStore('perPage', {
    transform: value => Math.max(10, parseInt(value)),
    get: () => appStore.getSettings(VIEW, 'perPage'),
    set: perPage => appStore.setSettings(VIEW, { perPage })
  }),
  options: [{ value: 10 }, { value: 25 }, { value: 50 }, { value: 100 }]
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
    class="entity-list-settings"
    :title="t('entity.settings.title')"
    :hide="hide"
    :visible="visible"
    :placement="placement"
    route="entity.list"
    @reset="reset"
  >
    <page-settings-section
      v-model="sortBy.modelValue"
      v-model:open="sortBy.open"
      class="entity-list-settings__section entity-list-settings__section--sort-by"
      :type="sortBy.type"
      :options="sortBy.options"
      :label="sortBy.label"
      @update:model-value="resetPage"
    />
    <page-settings-section
      v-model="perPage.modelValue"
      v-model:open="perPage.open"
      class="entity-list-settings__section entity-list-settings__section--per-page"
      :type="perPage.type"
      :options="perPage.options"
      :label="perPage.label"
      @update:model-value="resetPage"
    />
  </page-settings>
</template>
