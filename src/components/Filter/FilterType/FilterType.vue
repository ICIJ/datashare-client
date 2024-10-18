<script setup>
import { computed, ref, reactive, onBeforeMount, watch } from 'vue'
import { useStore } from 'vuex'
import { concat, compact, escapeRegExp, flatten, get, noop, uniqueId, pick, setWith } from 'lodash'
import InfiniteLoading from 'v3-infinite-loading'

import { useWait } from '@/composables/wait'
import { useSearchFilter } from '@/composables/search-filter'
import FiltersPanelSectionFilter from '@/components/FiltersPanel/FiltersPanelSectionFilter'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import settings from '@/utils/settings'

const { filter } = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const query = defineModel('query', { type: String, default: '' })
const emit = defineEmits(['aggregate', 'update', 'update:filter-value'])

const pages = reactive([])
const collapse = ref(true)

const { wait } = useWait()
const store = useStore()

const aggregateWithLoading = async ({ clearPages = false } = {}) => {
  wait.start(loaderId.value)
  const page = await aggregate({ clearPages })
  wait.end(loaderId.value)
  return page
}

const aggregateOverWithLoading = () => {
  return aggregateWithLoading({ clearPages: true })
}

const aggregateIfVisible = () => {
  if (!collapse.value) {
    return aggregateOverWithLoading()
  }
}

const aggregate = async ({ clearPages = false } = {}) => {
  /**
   * Triggered when a filter received instruction to be load data
   */
  emit('aggregate', filter)

  if (!fromElasticSearch.value || (!clearPages && reachedBucketsEnd.value)) {
    return false
  }

  const name = filter.name
  const from = clearPages ? 0 : offset.value
  const options = aggregationOptions.value
  const page = await store.dispatch('search/queryFilter', { name, from, options, size: size.value })

  // Wait for the page to be loaded to clear pages to avoid flickering
  if (clearPages) {
    pages.splice(0, pages.length)
  }

  pages.push(page)

  return page
}

const queryTokens = computed(() => [escapeRegExp(query.value.toLowerCase())])

const hasFilterQuery = computed(() => {
  // The filter has a query if:
  //   * it is searchable
  //   * the query is not empty
  //   * it has an "alternativeSearch" function to generate query tokens
  return !filter.hideSearch && query.value !== '' && !!filter.alternativeSearch
})

const lastPage = computed(() => pages[pages.length - 1])

const pageBucketsPath = computed(() => ['aggregations', filter.key, 'buckets'])

const lastPageBuckets = computed(() => {
  return get(lastPage.value, pageBucketsPath.value, [])
})

const aggregationInclude = computed(() => {
  const alternativeSearch = compact(filter.alternativeSearch(query.value.toLowerCase()))
  return '.*(' + concat(alternativeSearch, queryTokens.value).join('|') + ').*'
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
  await aggregateWithLoading()
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
  watchFilterContextualized,
  watchFilterSort,
  watchFilterValues,
  watchFilterExcluded,
  watchQuery,
  watchProjects,
  watchValues,
  whenFilterContextualized
} = useSearchFilter()

const exclude = computedExcludeFilter(filter)
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
  if (contextualize.value) {
    await aggregateOverWithLoading()
  }
}

const bucketLabel = (bucket) => {
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
    const values = filter.values.map((key) => ({ key, doc_count: 0 }))
    return setWith({}, pageBucketsPath.value.join('.'), values, Object)
  }
  return []
})

const bucketsWithExcludedValues = computed(() => {
  return flatten(concat([excludedBucketsPage.value], pages).map(getPageBuckets))
})

const entries = computed(() => {
  return bucketsWithExcludedValues.value.map((item) => {
    const value = item?.key?.toString()
    const label = bucketLabel(item)
    return { item, value, label }
  })
})

const loaderId = computed(() => uniqueId('loader-search-filter-'))

const infiniteId = ref(uniqueId('infinite-search-filter-'))
const reachedBucketsEnd = computed(() => pages.length && lastPageBuckets.value.length < size.value)

const noInfiniteScroll = computed(() => filter.noInfiniteScroll || !pages.length || reachedBucketsEnd.value)
const noBucketTranslation = computed(() => filter?.noBucketTranslation ?? false)
const fromElasticSearch = computed(() => filter?.fromElasticSearch ?? false)
const count = computed(() => filter.values.length)
const offset = computed(() => buckets.value?.length ?? 0)
const size = computed(() => settings.filter.bucketSize)

const update = () => {
  /**
   * Triggered when a filter must be updated
   */
  emit('update', filter)
  // We must aggregate the data only if the filter is visible (not collapsed) to
  // avoid unnecessary requests.
  return aggregateIfVisible()
}

onBeforeMount(async () => {
  // Show the filter by default if it has a value
  collapse.value = !hasAnyValue.value
  // Only load data on mount if the filter is visible (not collapsed)
  await aggregateIfVisible()
  // Collapsing/Expanding the filter will trigger an update of the data
  watch(collapse, update)
  // Query value (in the search field) that trigger an update of the data
  watch(query, update)
  // General values that might trigger an update of the data
  watchProjects(update)
  // Filter values that trigger an update of the data
  watchFilterSort(filter, update)
  watchFilterContextualized(filter, update)
  // Filter values that trigger an update of the data only if the filter is contextualized
  watchFilterValues(filter, whenFilterContextualized(filter, update))
  watchQuery(filter, whenFilterContextualized(filter, update))
  watchFilterExcluded(filter, whenFilterContextualized(filter, update))
  // Values from all filters that trigger an update of the data only if the filter is contextualized
  watchValues(whenFilterContextualized(filter, update))
})
</script>

<template>
  <filters-panel-section-filter
    v-model:exclude="exclude"
    v-model:contextualize="contextualize"
    v-model:collapse="collapse"
    v-model:search="query"
    v-model:sort="sort"
    :hide-search="filter.hideSearch"
    :hide-sort="filter.hideSort"
    :hide-contextualize="filter.hideContextualize"
    :hide-exclude="filter.hideExclude"
    :hide-expand="filter.hideExpand"
    :title="$t(`filter.${filter.name}`)"
    :icon="filter.icon"
    :count="count"
    :loading="wait.is(loaderId)"
  >
    <slot v-bind="{ entries, filter }">
      <filters-panel-section-filter-entry
        v-for="{ item, label } in entries"
        :key="item.key"
        :label="label"
        :count="item.doc_count"
        :model-value="hasValue(item)"
        @update:model-value="toggleValue(item, $event)"
      >
        <slot name="entry-label" />
        <template #count>
          <slot name="entry-count" />
        </template>
      </filters-panel-section-filter-entry>
      <infinite-loading v-if="!noInfiniteScroll" :identifier="infiniteId" :distance="200" @infinite="nextAggregate">
        <template #spinner><span></span></template>
        <template #complete><span></span></template>
      </infinite-loading>
    </slot>
  </filters-panel-section-filter>
</template>
