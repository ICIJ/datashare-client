<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'
import IPhPath from '~icons/ph/path'

import SearchBreadcrumbFormEntry from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntry'
import { assembleEntries } from '@/composables/useSearchBreadcrumb'

const props = defineProps({
  icon: {
    type: [String, Object, Array],
    default: () => IPhPath
  },
  noLabel: {
    type: Boolean,
    default: false
  },
  labelClass: {
    type: [String, Array, Object]
  },
  entries: {
    type: Array,
    default: () => []
  },
  noXIcon: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click:entry-x'])
const { t } = useI18n()
const assembledEntries = computed(() => assembleEntries(props.entries))
const hasEntries = computed(() => assembledEntries.value.length > 0)
</script>

<template>
  <div class="search-breadcrumb-form-list d-flex flex-column gap-3">
    <div
      v-if="!noLabel"
      class="fw-medium text-action-emphasis text-nowrap"
      :class="labelClass"
    >
      <app-icon
        :name="icon"
        class="me-2"
      />
      <slot name="label">
        {{ t('searchBreadcrumbFormList.label') }}
      </slot>
    </div>
    <div class="search-breadcrumb-form-list__entries d-flex flex-wrap row-gap-2 column-gap-2 align-items-center">
      <template v-if="hasEntries">
        <search-breadcrumb-form-entry
          v-for="(entry, i) in assembledEntries"
          :key="i"
          v-bind="entry"
          :no-x-icon="noXIcon || entry.noXIcon"
          @click:x="emit('click:entry-x', $event, entry)"
        />
      </template>
      <slot v-else />
    </div>
  </div>
</template>
