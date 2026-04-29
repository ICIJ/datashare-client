<script setup>
import { computed, toRef, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import AppSpinner from '@/components/AppSpinner/AppSpinner.vue'
import ButtonToggleContentTypesView from '@/components/Button/ButtonToggleContentTypesView.vue'
import ContentTypesAll from '@/components/ContentTypes/ContentTypesCategories/ContentTypesAll.vue'
import ContentTypesCategories from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategories.vue'
import ContentTypesCategory from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategory.vue'
import ContentTypesCategoryName from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryName.vue'
import ContentTypesCategoryItem from '@/components/ContentTypes/ContentTypesCategories/ContentTypesCategoryItem.vue'
import ContentTypesEntry from '@/components/ContentTypes/ContentTypesCategories/ContentTypesEntry.vue'
import FilterType from './FilterType.vue'
import { useContentTypeCategories } from '@/composables/useContentTypeCategories'
import { useContentTypeCategoryAvailability } from '@/composables/useContentTypeCategoryAvailability'
import { useContentTypeCategoryLabel } from '@/composables/useContentTypeCategoryLabel'
import { useContentTypeSearchFilter } from '@/composables/useContentTypeSearchFilter'
import { useContentTypeSelection } from '@/composables/useContentTypeSelection'
import { useContentTypeSort } from '@/composables/useContentTypeSort'
import { useSearchFilter } from '@/composables/useSearchFilter'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const collapse = defineModel('collapse', { type: Boolean, default: null })
const grouped = defineModel('grouped', { type: Boolean, default: false })

const { t } = useI18n()

const filterRef = toRef(props, 'filter')

// Legacy projects re-indexed before category grouping landed lack the
// contentTypeCategory mapping — surface an overlay so the disabled grouped
// view is explained.
const {
  isAvailable: isCategoryAvailable,
  isLoading: isCategoryAvailabilityLoading
} = useContentTypeCategoryAvailability()
const isLegacyIndexOverlayVisible = computed(() => !isCategoryAvailable.value)

const filterTypeRef = useTemplateRef('filterTypeRef')
const entries = computed(() => filterTypeRef.value?.entries ?? [])
const contentTypes = computed(() => entries.value.map(entry => entry.item.key))

const { categories } = useContentTypeCategories(contentTypes)
const {
  toggleFilterValue,
  hasFilterValue,
  computedAll,
  computedTotal,
  getFilterPairedDimensions
} = useSearchFilter()
const categoryLabelFor = useContentTypeCategoryLabel()

const {
  isEntrySelected,
  isEntryRetainedDuringSearch,
  categoryAllSelected,
  categoryIndeterminate,
  toggleCategory,
  toggleEntry
} = useContentTypeSelection({ filter: filterRef, categories })

const {
  query,
  visibleTypesFor,
  visibleEntries,
  filteredCategoryPairs
} = useContentTypeSearchFilter({
  contentTypes,
  categories,
  categoryLabelFor,
  isContentTypeRetained: isEntryRetainedDuringSearch
})

const {
  entryCount,
  categoryCount,
  sortedCategoryEntries,
  sortedTypesFor
} = useContentTypeSort({
  entries,
  filter: filterRef,
  categoryLabelFor,
  filteredCategoryPairs
})

// "All-selected" reflects the union with the paired contentTypeCategory —
// a selection in either dimension keeps "All" enabled.
const pairedFilters = computed(() => getFilterPairedDimensions(filterRef))
const allSelected = computedAll(pairedFilters)
const totalCount = computedTotal(filterRef)
</script>

<template>
  <filter-type
    ref="filterTypeRef"
    v-model:query="query"
    v-model:collapse="collapse"
    :filter="props.filter"
    :overlay-show="grouped && (isLegacyIndexOverlayVisible || isCategoryAvailabilityLoading)"
    class="filter-type-file-types"
  >
    <template #overlay>
      <app-spinner
        v-if="isCategoryAvailabilityLoading"
        class="filter-type-file-types__spinner"
      />
      <div
        v-else
        class="filter-type-file-types__legacy-index"
      >
        <p class="filter-type-file-types__legacy-index__title fw-bold mb-1">
          {{ t('filter.fileTypes.legacyIndex.title') }}
        </p>
        <p class="filter-type-file-types__legacy-index__description small mb-0">
          {{ t('filter.fileTypes.legacyIndex.description') }}
        </p>
      </div>
    </template>
    <template #all>
      <content-types-all
        v-model="allSelected"
        :count="totalCount"
      />
    </template>
    <template #default="{ entries: slotEntries }">
      <content-types-categories>
        <template v-if="grouped">
          <content-types-category
            v-for="[category, types] in sortedCategoryEntries"
            :key="category"
          >
            <content-types-category-name
              :category="category"
              :count="categoryCount(types)"
              :model-value="categoryAllSelected(category, types)"
              :indeterminate="categoryIndeterminate(category, types)"
              @update:model-value="toggleCategory(category, types, $event)"
            />
            <content-types-category-item
              v-for="contentType in sortedTypesFor(visibleTypesFor(category, types))"
              :key="contentType"
              :content-type="contentType"
              :count="entryCount(contentType)"
              :model-value="isEntrySelected(contentType)"
              @update:model-value="toggleEntry(contentType, $event)"
            />
          </content-types-category>
        </template>
        <template v-else>
          <content-types-entry
            v-for="entry in visibleEntries(slotEntries)"
            :key="entry.item.key"
            :content-type="entry.item.key"
            :count="entry.item.doc_count"
            :model-value="hasFilterValue(props.filter, entry.item)"
            @update:model-value="toggleFilterValue(props.filter, entry.item, $event)"
          />
        </template>
      </content-types-categories>
    </template>

    <template #actions>
      <button-toggle-content-types-view v-model:grouped="grouped" />
    </template>
  </filter-type>
</template>

<style lang="scss" scoped>
.filter-type-file-types {
  &__spinner {
    display: flex;
    justify-content: center;
    padding: $spacer;
  }

  &__legacy-index {
    text-align: center;
  }
}
</style>
