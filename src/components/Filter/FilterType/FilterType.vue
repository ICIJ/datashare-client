<script setup>
import { computed, nextTick, onBeforeMount, reactive, ref, watch } from 'vue'
import compact from 'lodash/compact'
import concat from 'lodash/concat'
import escapeRegExp from 'lodash/escapeRegExp'
import flatten from 'lodash/flatten'
import get from 'lodash/get'
import noop from 'lodash/noop'
import setWith from 'lodash/setWith'
import toString from 'lodash/toString'
import uniqueId from 'lodash/uniqueId'
import InfiniteLoading from 'v3-infinite-loading'
import { useI18n } from 'vue-i18n'

import { refWhenever } from '@/composables/refWhenever'
import { useWait } from '@/composables/useWait'
import { useSearchFilter } from '@/composables/useSearchFilter'
import FilterModal from '@/components/Filter/FilterModal/FilterModal'
import FiltersPanelSectionFilter from '@/components/FiltersPanel/FiltersPanelSectionFilter'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import FilterTypeAll from '@/components/Filter/FilterType/FilterTypeAll'
import settings from '@/utils/settings'
import { useSearchStore, useLockedFiltersStore } from '@/store/modules'
import builtinFilterIcons from '@/store/filters/icons'

const query = defineModel('query', { type: String, default: '' })
const collapse = defineModel('collapse', { type: Boolean, default: null })

const { filter, modal, hideCount, overlayShow } = defineProps({
  filter: {
    type: Object,
    required: true
  },
  modal: {
    type: Boolean
  },
  hideCount: {
    type: Boolean
  },
  // Forwarded to FiltersPanelSectionFilter to surface an informational
  // overlay on top of the filter content (search + entries) — never on the
  // title, never while collapsed.
  overlayShow: {
    type: Boolean,
    default: false
  }
})

const opened = refWhenever(collapse, value => value === false || modal === true)
const { t } = useI18n()

const icon = computed(() => filter.icon ?? builtinFilterIcons[filter.name])

const pages = reactive([])
const expand = ref(false)

const { waitFor, isLoading } = useWait({ throttle: 500 })
const searchStore = useSearchStore.inject()
const lockedFiltersStore = useLockedFiltersStore()

const aggregateOver = () => {
  return aggregate({ clearPages: true })
}

const aggregateIfVisible = () => {
  if (modal || !collapse.value) {
    return aggregateOver()
  }
}

const aggregate = waitFor(async ({ clearPages = false } = {}) => {
  if (!fromElasticSearch.value || (!clearPages && reachedBucketsEnd.value)) {
    return false
  }

  const name = filter.name
  const from = clearPages ? 0 : offset.value
  const options = aggregationOptions.value
  const page = await searchStore.queryFilter({ name, from, options, size: size.value })

  // Wait for the page to be loaded to clear pages to avoid flickering
  if (clearPages) {
    pages.splice(0, pages.length)
  }

  pages.push(page)

  return page
})

const queryTokens = computed(() => [escapeRegExp(query.value.toLowerCase())])

const hasFilterQuery = computed(() => {
  // The filter has a query if:
  //   * it is searchable
  //   * the query is not empty
  //   * it has a "keyAliases" function to generate additional bucket-key tokens
  return !filter.hideSearch && query.value !== '' && !!filter.keyAliases
})

const lastPage = computed(() => pages[pages.length - 1])

const pageBucketsPath = computed(() => ['aggregations', filter.key, 'buckets'])

const lastPageBuckets = computed(() => {
  return get(lastPage.value, pageBucketsPath.value, [])
})

const aggregationInclude = computed(() => {
  const aliases = compact(filter.keyAliases(query.value.toLowerCase()))
  return '.*(' + concat(aliases, queryTokens.value).join('|') + ').*'
})

const aggregationOptions = computed(() => {
  // Add an include option if the filter has a query
  const include = hasFilterQuery.value ? aggregationInclude.value : undefined
  const order = { [sort.value.sortBy]: sort.value.orderBy }
  // Merge the options object with the filter's query
  // The "size" attribute must be as big as the number of displayed buckets
  return { include, size: offset.value + size.value, order }
})

const nextAggregate = async ($infiniteLoadingState) => {
  await aggregate()
  // Did we reach the end?
  const method = reachedBucketsEnd.value ? 'complete' : 'loaded'
  // Call the right method (with "noop" as safety net in case the method can't be found)
  return get($infiniteLoadingState, method, noop)()
}

const getPageBuckets = (page) => {
  return get(page, pageBucketsPath.value, [])
}

const {
  hasFilterValue,
  hasAnyFilterValue,
  labelToHuman,
  computedSortFilter,
  computedContextualizeFilter,
  computedExcludeFilter,
  toggleFilterValue,
  getFilterPairedDimensions,
  getFilterValuesByName
} = useSearchFilter()

const exclude = computedExcludeFilter(filter)
// The store key for this filter's locks: the filter's own current
// include/exclude mode, never a paired dimension's — locking a chip on one
// side of a paired filter must never lock or affect the other side.
const lockedName = computed(() => (exclude.value ? `-${filter.name}` : filter.name))
const sort = computedSortFilter(filter)
const contextualize = computedContextualizeFilter(filter)

const hasValue = (item) => {
  return hasFilterValue(filter, item)
}

const hasAnyValue = computed(() => {
  return hasAnyFilterValue(filter)
})

const toggleValue = async (item, checked) => {
  await toggleFilterValue(filter, item, checked)
  if (!checked) {
    lockedFiltersStore.unlock({ name: lockedName.value, value: item.key })
  }
  if (contextualize.value) {
    await aggregateOver()
  }
}

function isItemLocked(item) {
  return lockedFiltersStore.isLocked({ name: lockedName.value, value: item.key })
}

function toggleLock(item, locked) {
  if (locked) {
    lockedFiltersStore.lock({ name: lockedName.value, value: item.key, label: bucketLabel(item) })
  }
  else {
    lockedFiltersStore.unlock({ name: lockedName.value, value: item.key })
  }
}

const bucketLabel = (bucket) => {
  if (bucket?.__lockedLabel != null) {
    return bucket.__lockedLabel
  }
  if (noBucketTranslation.value) {
    return bucket?.key?.toString()
  }
  return labelToHuman(filter.itemLabel(bucket))
}

const buckets = computed(() => {
  return flatten(pages.map(getPageBuckets))
})

const excludedBucketsPage = computed(() => {
  if (contextualize.value && exclude.value) {
    const values = filter.values.map(key => ({ key, doc_count: 0 }))
    return setWith({}, pageBucketsPath.value.join('.'), values, Object)
  }
  return []
})

// Synthesizes a zero-count bucket for every locked value that has no
// matching real aggregation bucket (a deleted tag, a re-indexed path).
// Uses the exact same shape/insertion mechanism as excludedBucketsPage
// above so it flows through bucketsWithExcludedValues unchanged.
const missingLockedBucketsPage = computed(() => {
  const realKeys = buckets.value.map(item => toString(item.key))
  const missing = lockedFiltersStore.entries
    .filter(entry => entry.name === lockedName.value && !realKeys.includes(entry.value))
    .map(entry => ({ key: entry.value, doc_count: 0, __lockedLabel: entry.label }))
  return setWith({}, pageBucketsPath.value.join('.'), missing, Object)
})

const bucketsWithExcludedValues = computed(() => {
  return flatten(concat([excludedBucketsPage.value, missingLockedBucketsPage.value], pages).map(getPageBuckets))
})

const entries = computed(() => {
  return bucketsWithExcludedValues.value.map((item) => {
    const value = item?.key?.toString()
    const label = bucketLabel(item)
    return { item, value, label }
  })
})

const infiniteId = ref(uniqueId('infinite-search-filter-'))
const reachedBucketsEnd = computed(() => pages.length && lastPageBuckets.value.length < size.value)

const isPageless = computed(() => filter.pagelessBucketSize != null)
const hasNoPages = computed(() => !pages.length)
const noInfiniteScroll = computed(() => isPageless.value || hasNoPages.value || reachedBucketsEnd.value)
const noBucketTranslation = computed(() => filter?.noBucketTranslation ?? false)
const fromElasticSearch = computed(() => filter?.fromElasticSearch ?? false)
const offset = computed(() => buckets.value?.length ?? 0)
const size = computed(() => filter.pagelessBucketSize ?? settings.filter.bucketSize)
// Sum across paired dimensions so the closed-state badge matches the OR
// semantics used in search; unpaired filters fall back to [name].
const count = computed(() => {
  return getFilterPairedDimensions(filter).reduce((sum, name) => {
    return sum + getFilterValuesByName(name).length
  }, 0)
})

const debouncedCollapse = computed({
  get: () => collapse.value,
  set: async (value) => {
    if (value) {
      collapse.value = true
    }
    else {
      await aggregateOver()
      await nextTick()
      collapse.value = false
    }
  }
})

// Computed that tracks all dependencies that should trigger aggregation
// Consolidates 8 separate watchers into one to reduce cascading API calls
const aggregationDependencies = computed(() => {
  return {
    query: query.value,
    indices: searchStore.indices.join(','),
    sort: JSON.stringify(sort.value),
    contextualize: contextualize.value,
    // Only include these when contextualized
    ...(contextualize.value && {
      filterValues: JSON.stringify(filter.values),
      excluded: exclude.value,
      allValues: JSON.stringify(searchStore.values),
      searchQuery: searchStore.q
    })
  }
})

onBeforeMount(async () => {
  // Show the filter by default if it has a value
  collapse.value = collapse.value ?? !hasAnyValue.value
  // Only load data on mount if the filter is visible (not collapsed)
  await aggregateIfVisible()
  // Single watcher that consolidates all 8 previous watchers
  // This reduces cascading API calls by debouncing all dependency changes
  watch(aggregationDependencies, aggregateIfVisible, { deep: false })
})

defineExpose({ entries, aggregateOver, count })
</script>

<template>
  <filters-panel-section-filter
    v-model:exclude="exclude"
    v-model:contextualize="contextualize"
    v-model:collapse="debouncedCollapse"
    v-model:search="query"
    v-model:sort="sort"
    v-model:expand="expand"
    :hide-search="filter.hideSearch"
    :hide-sort="filter.hideSort"
    :hide-contextualize="filter.hideContextualize"
    :hide-exclude="filter.hideExclude"
    :hide-expand="filter.hideExpand"
    :title="t(`filter.${filter.name}`)"
    :icon="icon"
    :count="count"
    :loading="isLoading"
    :modal="modal"
    :overlay-show="overlayShow"
  >
    <template
      v-if="$slots.overlay"
      #overlay
    >
      <slot
        name="overlay"
        v-bind="{ filter, opened }"
      />
    </template>
    <slot
      v-if="!query"
      name="all"
      v-bind="{ entries, filter, opened }"
    >
      <filter-type-all
        v-if="!filter.hideAll"
        :filter="filter"
      />
    </slot>
    <template #search="{ search, searchPlaceholder }">
      <slot
        name="search"
        v-bind="{ search, searchPlaceholder }"
      />
    </template>
    <template #actions>
      <slot name="actions" />
    </template>
    <slot v-bind="{ entries, filter, opened }">
      <filters-panel-section-filter-entry
        v-for="{ item, label } in entries"
        :key="item.key"
        :label="label"
        :count="item.doc_count"
        :hide-count="hideCount"
        :model-value="hasValue(item)"
        :locked="isItemLocked(item)"
        @update:model-value="toggleValue(item, $event)"
        @update:locked="toggleLock(item, $event)"
      >
        <slot name="entry-label" />
        <template #count>
          <slot name="entry-count" />
        </template>
      </filters-panel-section-filter-entry>
      <infinite-loading
        v-if="!noInfiniteScroll"
        :identifier="infiniteId"
        :distance="200"
        @infinite="nextAggregate"
      >
        <template #spinner>
          <span />
        </template>
        <template #complete>
          <span />
        </template>
      </infinite-loading>
    </slot>
    <filter-modal
      v-model="expand"
      v-model:sort="sort"
      :filter="filter"
      :hide-count="hideCount"
      :modal="modal"
    />
  </filters-panel-section-filter>
</template>
