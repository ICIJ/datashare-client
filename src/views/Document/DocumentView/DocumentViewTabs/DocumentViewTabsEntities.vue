<script setup>
import { computed, onMounted, ref, inject, watch } from 'vue'
import { flatten, get, mapValues, property, pickBy, sumBy, throttle } from 'lodash'

import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import { useConfig } from '@/composables/useConfig'
import { useDocument } from '@/composables/useDocument'
import { useWait } from '@/composables/useWait'
import EntitySection from '@/components/Entity/EntitySection/EntitySection'
import { useDocumentStore } from '@/store/modules'

const { document } = useDocument()
const { isLoading, waitFor } = useWait()
const config = useConfig()
const documentStore = useDocumentStore()
const filterToken = ref(null)

const mustExtractEntities = computed(() => canManageDocuments.value && !hasNerTags.value)
const canManageDocuments = computed(() => config.is('manageDocuments'))
const loadingNamedEntities = computed(() => isLoading.value)
const hasNerTags = computed(() => document.value.hasNerTags)
const hasEntities = computed(() => sumBy(categories.value, getCategoryTotal))

const namedEntitiesPaginatedByCategories = computed(() => documentStore.namedEntitiesPaginatedByCategories)
const namedEntitiesByCategories = computed(() => {
  const namedEntitiesByCategories = mapValues(namedEntitiesPaginatedByCategories.value, (pages) => {
    return flatten(pages.map((page) => page.hits))
  })
  return pickBy(namedEntitiesByCategories, (hits, category) => !!hits.length && categoryIsNotEmpty(category))
})

const hitsAsCsv = (hits = []) => {
  const csvHeader = ['mentionNorm', 'occurrences'].join(',')
  const csvBody = hits
    .map(({ source }) => {
      return [source.mentionNorm, source.offsets.length].join(',')
    })
    .join('\n')
  return [csvHeader, csvBody].join('\n')
}

const downloadHitsAsCsv = (hits = [], category) => {
  const content = hitsAsCsv(hits)
  const a = window.document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=UTF-8' }))
  a.download = `${documentStore.document.title} - ${category}.csv`
  a.click()
}

const copyHits = (hits = []) => {
  const content = hits.map(property('source.mentionNorm')).join('\n')
  navigator.clipboard.writeText(content)
}

const hitsWithRoute = (hits) => {
  return hits.map(({ source, mention: q }) => {
    const modal = inject('modal', undefined)
    const tab = 'text'
    const to = { query: { q, modal, tab } }
    return { ...source, to }
  })
}

const categories = computed(() => documentStore.categories)
const getCategoryTotal = (category) => get(namedEntitiesPaginatedByCategories.value, [category, 0, 'total'], 0)
const getCategoryCount = (category) => documentStore.countNamedEntitiesInCategory(category)
const categoryIsNotEmpty = (category) => !!getCategoryTotal(category)
const categoryHasNextPage = (category) => getCategoryTotal(category) > getCategoryCount(category)

const getNextPageInCategory = async (category) => {
  if (!loadingNamedEntities.value) {
    return documentStore.getNextPageForNamedEntityInCategory({ category, filterToken: filterToken.value })
  }
}

const getFirstPageInAllCategories = waitFor(async () => {
  await documentStore.getFirstPageForNamedEntityInAllCategories({ filterToken: filterToken.value })
})

const getFirstPageInAllCategoriesWithThrottle = throttle(getFirstPageInAllCategories, 1000)

watch(filterToken, (newFilterToken) => {
  if (!newFilterToken) {
    return getFirstPageInAllCategories()
  }
  return getFirstPageInAllCategoriesWithThrottle()
})

onMounted(getFirstPageInAllCategories)
</script>

<template>
  <div class="document-view-tabs-entities">
    <div class="document-view-tabs-entities__search bg-body sticky-top py-3">
      <form-control-search
        v-model="filterToken"
        :loading="isLoading"
        :placeholder="$t('document.namedEntityFilter')"
        clear-text
        shadow
      />
    </div>
    <i18n-t
      v-if="mustExtractEntities"
      tag="div"
      keypath="document.namedEntitiesNotSearched"
      class="document-view-tabs-entities__not-searched py-3 text-center"
    >
      <template #link>
        <router-link :to="{ name: 'task.entities.new' }">
          {{ $t('document.namedEntitiesNotSearchedLink') }}
        </router-link>
      </template>
    </i18n-t>
    <i18n-t
      v-else-if="!hasEntities && !loadingNamedEntities"
      tag="div"
      keypath="document.namedEntitiesNotFound"
      class="document-view-tabs-entities__not-found py-3 text-center"
    />
    <entity-section
      v-for="(hits, category) in namedEntitiesByCategories"
      :key="category"
      :category="category"
      :count="getCategoryTotal(category)"
      :entries="hitsWithRoute(hits)"
      :has-more="categoryHasNextPage(category)"
      @download="downloadHitsAsCsv(hits, category)"
      @copy="copyHits(hits)"
      @more="getNextPageInCategory(category)"
    />
  </div>
</template>
