<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { capitalize, flatten, get, mapValues, sumBy, pickBy, throttle } from 'lodash'

import EntityButton from '@/components/Entity/EntityButton'
import EntityOccurrences from '@/components/Entity/EntityOccurrences'
import EntityInContext from '@/components/Entity/EntityInContext'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import { useCore } from '@/composables/core'
import { useDocument } from '@/composables/document'
import { useWait } from '@/composables/wait'
import { getCategoryIcon } from '@/utils/entity'

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
  return pickBy(namedEntitiesByCategories, (hits) => !!hits.length)
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

const categories = computed(() => store.getters['document/categories'])
const getCategoryTotal = (category) => get(namedEntitiesPaginatedByCategories.value, [category, 0, 'total'], 0)
const categoryIsNotEmpty = (category) => !!getCategoryTotal(category)
const categoryHasNextPage = (category) => {
  return getCategoryTotal(category) > store.getters['document/countNamedEntitiesInCategory'](category)
}

const getNextPageInCategory = async (category) => {
  if (!loadingNamedEntities.value) {
    store.dispatch('document/getNextPageForNamedEntityInCategory', { category, filterToken: filterToken.value })
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
  <div class="bg-body sticky-top py-3">
    <form-control-search
      v-model="filterToken"
      :loading="$wait.is(loaderId)"
      :placeholder="$t('document.namedEntityFilter')"
      clear-text
      shadow
    />
  </div>

  <div class="text-center">
    <i18n-t v-if="mustExtractEntities" keypath="document.namedEntitiesNotSearched">
      <template #link>
        <router-link :to="{ name: 'task.entities.new' }">
          {{ $t('document.namedEntitiesNotSearchedLink') }}
        </router-link>
      </template>
    </i18n-t>
    <i18n-t v-else-if="!hasEntities && !loadingNamedEntities" keypath="document.namedEntitiesNotFound" />
  </div>

  <div v-for="(hits, category) in namedEntitiesByCategories" :key="category" class="mb-5">
    <h3 v-if="categoryIsNotEmpty(category)" class="mb-3 d-flex align-items-center gap-2 h6 fw-normal">
      <phosphor-icon :name="getCategoryIcon(category)" weight="bold" />
      {{ $t('filter.namedEntity' + capitalize(category)) }}
      <entity-occurrences :occurrences="getCategoryTotal(category)" />
      <haptic-copy
        variant="tertiary"
        class="p-2 ms-auto"
        hide-label
        :label="$t('document.copyAsCsv')"
        :text="hitsAsCsv(hits)"
      />
    </h3>
    <div class="d-flex flex-wrap gap-2 mb-3">
      <span v-for="(entity, index) in hits" :key="index" class="d-inline-block">
        <entity-button
          :id="`entity-${entity.id}`"
          :entity="entity"
          :to="{ name: `${documentRoute.name}.text`, query: { q: entity.mention } }"
        />
        <entity-in-context :entity="entity" :document="document" :target="`entity-${entity.id}`" />
      </span>
    </div>
    <b-button v-if="categoryHasNextPage(category)" variant="outline-primary" @click="getNextPageInCategory(category)">
      {{ $t('document.namedEntitiesShowMore.showMore' + capitalize(category)) }}
    </b-button>
  </div>
</template>
