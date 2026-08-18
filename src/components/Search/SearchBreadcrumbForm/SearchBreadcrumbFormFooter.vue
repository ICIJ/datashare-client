<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur'
import IPhEraser from '~icons/ph/eraser'
import IPhXCircle from '~icons/ph/x-circle'
import IPhArrowCounterClockwise from '~icons/ph/arrow-counter-clockwise'
import IPhFloppyDiskBack from '~icons/ph/floppy-disk-back'
import IPhSiren from '~icons/ph/siren'
import IPhLockOpen from '~icons/ph/lock-open'

import FormActions from '@/components/Form/FormActions/FormActions'

defineProps({
  disabledClearFilters: {
    type: Boolean
  },
  disabledClearQuery: {
    type: Boolean
  },
  disabledClearFiltersAndQuery: {
    type: Boolean
  },
  disabledSaveSearch: {
    type: Boolean
  },
  disabledCreateAlert: {
    type: Boolean
  },
  lockedFiltersCount: {
    type: Number,
    default: 0
  }
})
const { t } = useI18n()
const emit = defineEmits(['clear:filters', 'clear:query', 'clear:all', 'unlock:all', 'save:search', 'create:alert'])
</script>

<template>
  <form-actions
    class="search-breadcrumb-form-footer"
    variant="link"
    end
    compact-auto
  >
    <template #compact>
      <button-icon
        :disabled="disabledClearFilters"
        :icon-left="IPhEraser"
        @click="emit('clear:filters')"
      >
        {{ t('searchBreadcrumbFormFooter.clearFilters') }}
      </button-icon>
      <button-icon
        :disabled="disabledClearQuery"
        :icon-left="IPhXCircle"
        @click="emit('clear:query')"
      >
        {{ t('searchBreadcrumbFormFooter.clearQuery') }}
      </button-icon>
      <button-icon
        :disabled="disabledClearFiltersAndQuery"
        :icon-left="IPhArrowCounterClockwise"
        @click="emit('clear:all')"
      >
        {{ t('searchBreadcrumbFormFooter.clearFiltersAndQuery') }}
      </button-icon>
      <!--
        Whenever Story 6 (icij/datashare#2332) lands, this button's slot is
        replaced by "Apply locked filters" while a lock conflicts with the
        active search — see the spec's Story 4 section for the full rule.
      -->
      <button-icon
        v-if="lockedFiltersCount > 0"
        :icon-left="IPhLockOpen"
        @click="emit('unlock:all')"
      >
        {{ t('searchBreadcrumbFormFooter.unlockFilters', { count: lockedFiltersCount }) }}
      </button-icon>
      <button-icon
        :disabled="disabledSaveSearch"
        variant="outline-dark"
        :icon-left="IPhFloppyDiskBack"
        @click="emit('save:search')"
      >
        {{ t('searchBreadcrumbFormFooter.saveSearch') }}
      </button-icon>
      <button-icon
        v-if="false /* Disabled until the feature is implemented */"
        :disabled="!disabledCreateAlert"
        variant="outline-dark"
        :icon-left="IPhSiren"
        @click="emit('create:alert')"
      >
        {{ t('searchBreadcrumbFormFooter.createAlert') }}
      </button-icon>
    </template>
  </form-actions>
</template>
