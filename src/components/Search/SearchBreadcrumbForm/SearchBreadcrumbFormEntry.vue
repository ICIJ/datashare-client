<script setup>
import { computed } from 'vue'
import { AppIcon, ButtonIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'
import IPhCaretRightFill from '~icons/ph/caret-right-fill'
import IPhLock from '~icons/ph/lock'
import IPhLockOpen from '~icons/ph/lock-open'

import SearchBreadcrumbFormEntryOccurrences from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntryOccurrences'
import SearchParameter from '@/components/Search/SearchParameter/SearchParameter'
import { useLockedFiltersStore } from '@/store/modules'

const props = defineProps({
  filter: {
    type: String
  },
  query: {
    type: String
  },
  value: {
    type: String
  },
  color: {
    type: String,
    default: null
  },
  icon: {
    type: [String, Object, Array],
    default: null
  },
  size: {
    type: String
  },
  occurrences: {
    type: Number,
    default: null
  },
  previousOccurrences: {
    type: Number,
    default: null
  },
  noCaret: {
    type: Boolean
  },
  noOccurrences: {
    type: Boolean
  },
  noIcon: {
    type: Boolean
  },
  noXIcon: {
    type: Boolean
  },
  operator: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['click:x'])

const { t } = useI18n()
const lockedFiltersStore = useLockedFiltersStore()

const showOccurrences = computed(() => {
  return !props.noOccurrences && props.occurrences !== null
})

const showCaret = computed(() => {
  return !props.noCaret && props.occurrences !== null
})

// Locks only apply to filter chips, never the free-text query chip, and
// never the project chip — projects are keyed via `indices` rather than the
// `f[name]`/`f[-name]` scheme locked filters merge against on hydration
// (see icij/datashare#2336 for the same project-filter carve-out on the
// Filters panel side). Also never lockable when the chip is read-only
// (`noXIcon`): read-only breadcrumbs render disposable/persisted queries
// (saved searches, batch search/download overviews), and a clickable
// padlock there would mutate the user's global lock store from a display
// that isn't the live search. See icij/datashare#2329.
const isLockable = computed(() => Boolean(props.filter) && props.filter !== 'project' && !props.noXIcon)

// `props.filter` already carries the `-` prefix for excluded filters (it's
// read straight off the `f[name]`/`f[-name]` route param in
// useSearchBreadcrumb.js), which is exactly the lock store's `name` format —
// no separate mode-derivation needed here.
const locked = computed(() => isLockable.value && lockedFiltersStore.isLocked({ name: props.filter, value: props.value }))

const lockLabel = computed(() => t(locked.value ? 'searchBreadcrumbFormEntry.unlock' : 'searchBreadcrumbFormEntry.lock'))

const classList = computed(() => {
  return {
    'search-breadcrumb-form-entry--locked': locked.value
  }
})

function toggleLock() {
  if (locked.value) {
    lockedFiltersStore.unlock({ name: props.filter, value: props.value })
  }
  else {
    lockedFiltersStore.lock({ name: props.filter, value: props.value, label: props.value })
  }
}
</script>

<template>
  <div
    class="search-breadcrumb-form-entry d-inline-flex flex-wrap align-items-center"
    :class="classList"
  >
    <search-parameter
      :color="color"
      :icon="icon"
      :filter="filter"
      :no-icon="noIcon"
      :operator="operator"
      :query="query"
      :size="size"
      :value="value"
      :no-x-icon="noXIcon"
      @click:x="emit('click:x', $event)"
    />
    <button-icon
      v-if="isLockable"
      square
      hide-label
      variant="link"
      size="sm"
      class="search-breadcrumb-form-entry__lock"
      :icon-left="locked ? IPhLock : IPhLockOpen"
      :pressed="locked"
      :label="lockLabel"
      @click="toggleLock"
    />
    <div class="text-nowrap">
      <search-breadcrumb-form-entry-occurrences
        v-if="showOccurrences"
        class="search-breadcrumb-form-entry__occurences"
        :occurrences="occurrences"
        :previous-occurrences="previousOccurrences"
      />
      <app-icon
        v-if="showCaret"
        role="separator"
        aria-hidden="true"
        class="search-breadcrumb-form-entry__caret"
        size="1em"
        :name="IPhCaretRightFill"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-breadcrumb-form-entry {
  align-items: center;
  color: var(--bs-secondary);

  &__lock {
    flex-shrink: 0;
    margin: 0 $spacer-xs;
  }

  &--locked :deep(.search-parameter-query-term) {
    border-style: solid;
    background: var(--bs-tertiary-bg-subtle);
  }
}
</style>
