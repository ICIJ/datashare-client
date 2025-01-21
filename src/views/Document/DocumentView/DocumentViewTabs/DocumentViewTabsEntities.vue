<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { flatten, get, mapValues, pickBy, sumBy, throttle } from 'lodash'

import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import { useCore } from '@/composables/core'
import { useDocument } from '@/composables/document'
import { useWait } from '@/composables/wait'
import EntitySection from '@/components/Entity/EntitySection/EntitySection'

const { document, documentRoute } = useDocument()
const { wait, waitFor, loaderId } = useWait()
const { core } = useCore()
const store = useStore()
const filterToken = ref(null)

const mustExtractEntities = computed(() => canManageDocuments.value && !hasNerTags.value)
const canManageDocuments = computed(() => core.config.is('manageDocuments'))
const loadingNamedEntities = computed(() => wait.is(loaderId))
const hasNerTags = computed(() => document.value.hasNerTags)
const hasEntities = computed(() => sumBy(categories.value, getCategoryTotal))

const namedEntitiesPaginatedByCategories = computed(() => store.state.document.namedEntitiesPaginatedByCategories)
const namedEntitiesByCategories = computed(() => {
  const namedEntitiesByCategories = mapValues(namedEntitiesPaginatedByCategories.value, (pages) => {
    return flatten(pages.map((page) => page.hits))
  })
  return pickBy(namedEntitiesByCategories, (hits, category) => !!hits.length && categoryIsNotEmpty(category))
})

const hitsAsCsv = (hits = []) => {
  const csvHeader = ['named entity', 'occurences'].join(',')
  const csvBody = hits
    .map(({ source }) => {
      return [source.mentionNorm, source.offsets.length].join(',')
    })
    .join('\n')
  return [csvHeader, csvBody].join('\n')
}
const hitsWithRoute = (hits) => {
  return hits.map((hit) => ({ ...hit, to: { name: `${documentRoute.value.name}.text`, query: { q: hit.mention } } }))
}

const categories = computed(() => store.getters['document/categories'])
const getCategoryTotal = (category) => get(namedEntitiesPaginatedByCategories.value, [category, 0, 'total'], 0)
const categoryIsNotEmpty = (category) => !!getCategoryTotal(category)
const categoryHasNextPage = (category) => {
  return getCategoryTotal(category) > store.getters['document/countNamedEntitiesInCategory'](category)
}

const getNextPageInCategory = (category) => {
  if (!loadingNamedEntities.value) {
    return store.dispatch('document/getNextPageForNamedEntityInCategory', { category, filterToken: filterToken.value })
  }
}

const getFirstPageInAllCategories = waitFor(loaderId, async () => {
  return store.dispatch('document/getFirstPageForNamedEntityInAllCategories', { filterToken: filterToken.value })
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
        :loading="$wait.is(loaderId)"
        :placeholder="$t('document.namedEntityFilter')"
        clear-text
        shadow
      />
    </div>

    <div class="document-view-tabs-entities__not-searched text-center">
      <i18n-t v-if="mustExtractEntities" keypath="document.namedEntitiesNotSearched">
        <template #link>
          <router-link :to="{ name: 'task.entities.new' }">
            {{ $t('document.namedEntitiesNotSearchedLink') }}
          </router-link>
        </template>
      </i18n-t>
      <i18n-t v-else-if="!hasEntities && !loadingNamedEntities" keypath="document.namedEntitiesNotFound" />
    </div>
    <entity-section
      v-for="(hits, category) in namedEntitiesByCategories"
      :key="category"
      :category="category"
      :count="getCategoryTotal(category)"
      :entries="hitsWithRoute(hits)"
      :has-more="categoryHasNextPage(category)"
      @download="hitsAsCsv(hits)"
      @more="getNextPageInCategory(category)"
    />
  </div>
</template>
