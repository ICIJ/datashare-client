<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur'
import IPhEraser from '~icons/ph/eraser'
import IPhXCircle from '~icons/ph/x-circle'
import IPhArrowCounterClockwise from '~icons/ph/arrow-counter-clockwise'
import IPhFloppyDiskBack from '~icons/ph/floppy-disk-back'
import IPhSiren from '~icons/ph/siren'
import IPhLock from '~icons/ph/lock-fill'
import IPhLockOpen from '~icons/ph/lock-open-fill'

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
  },
  hasConflictingLocks: {
    type: Boolean,
    default: false
  }
})
const { t } = useI18n()
const emit = defineEmits(['clear:filters', 'clear:query', 'clear:all', 'unlock:all', 'apply:locked-filters', 'save:search', 'create:alert'])
</script>

<template>
  <form-actions
    class="search-breadcrumb-form-footer"
    variant="link"
    end
    compact-auto
  >
    <template #compact>
      <!--
        Visible whenever any lock exists (same gate as "Unlock filters"), so the
        pair holds a stable position instead of popping in/out on every
        navigation — but only enabled while a lock actually conflicts with the
        active search (icij/datashare#2332).

        A disabled native <button> never fires mouse events, so a tooltip
        targeting the button itself never shows while disabled — the one time
        it's actually needed (confirmed: bootstrap-vue-next's v-b-tooltip
        directive stayed at opacity:0 even on a real hover of the wrapping
        span, its documented workaround for this exact case). A native `title`
        attribute on the wrapper sidesteps that entirely: browsers show it on
        hover regardless of the disabled child's pointer-events:none.
      -->
      <span
        v-if="lockedFiltersCount > 0"
        class="d-inline-block"
        :title="hasConflictingLocks ? null : t('searchBreadcrumbFormFooter.applyLockedFiltersDisabled')"
      >
        <button-icon
          :disabled="!hasConflictingLocks"
          :icon-left="IPhLockOpen"
          @click="emit('apply:locked-filters')"
        >
          {{ t('searchBreadcrumbFormFooter.applyLockedFilters') }}
        </button-icon>
      </span>
      <button-icon
        v-if="lockedFiltersCount > 0"
        :counter="lockedFiltersCount"
        counter-variant=""
        :icon-left="IPhLock"
        @click="emit('unlock:all')"
      >
        {{ t('searchBreadcrumbFormFooter.unlockFilters') }}
      </button-icon>
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

<style lang="scss" scoped>
.search-breadcrumb-form-footer {
  :deep(.button-icon-counter) {
    background-color: var(--bs-action-text-emphasis);
    color: var(--bs-body-bg) ;
  }
}
</style>
