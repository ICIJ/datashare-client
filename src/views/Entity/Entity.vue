<script setup>
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import iteratee from 'lodash/iteratee'

import searchEmpty from '@/assets/images/illustrations/search-empty-light.svg'
import searchEmptyDark from '@/assets/images/illustrations/search-empty-dark.svg'
import searchError from '@/assets/images/illustrations/app-modal-alert-naming-light.svg'
import searchErrorDark from '@/assets/images/illustrations/app-modal-alert-naming-dark.svg'
import EntityCard from '@/components/Entity/EntityCard/EntityCard'
import EntityCardPlaceholder from '@/components/Entity/EntityCard/EntityCardPlaceholder'
import EmptyState from '@/components/EmptyState/EmptyState'
import PageContainer from '@/components/PageContainer/PageContainer'
import RowPagination from '@/components/RowPagination/RowPagination'
import { entitiesIndex } from '@/api/elasticsearch'
import { useCore } from '@/composables/useCore'
import { useEntityStore } from '@/store/modules/entity'
import { useAppStore } from '@/store/modules'

const { t } = useI18n()
const route = useRoute()
const { core } = useCore()
const appStore = useAppStore()
const entityStore = useEntityStore()

// ponytail: a flat property list, so every card renders identical rows. Featured properties are
// per-schema and live in the ontology (ICIJ/datashare#2510); ICIJ/datashare#2508 derives the rows
// from each entity's own entityType once that endpoint exists.
const PROPERTIES = ['name', 'entityType', 'sourceDocument', 'model', 'project']

const INDEX_SUFFIX = entitiesIndex('')

/**
 * The project a hit belongs to, read from its own `_index`. The list is cross-project, so this
 * cannot come from a page-level selection. A hit whose index is not an entities index yields
 * null and is dropped rather than rendered pointing at a project that does not exist.
 *
 * The card takes this, not `_index`: its source-document links resolve against `<project>`, and
 * `<project>.entities` holds no documents. EntityCard defaults its own `index` to the project.
 */
function hitProject({ _index: index = '' } = {}) {
  return index.endsWith(INDEX_SUFFIX) ? index.slice(0, -INDEX_SUFFIX.length) : null
}

const entries = computed(() => {
  return entityStore.hits
    .map(hit => ({ hit, project: hitProject(hit) }))
    .filter(({ project }) => !!project)
})

const isLoading = computed(() => !entityStore.isReady)
const isErrored = computed(() => !isLoading.value && !!entityStore.error)
const isEmpty = computed(() => !isLoading.value && !isErrored.value && !entries.value.length)

/**
 * Every project the user can see. The list is cross-project by design, and an empty list makes
 * the store skip the request rather than let elasticsearch read the whole cluster.
 */
const userProjects = computed(() => core.config.get('projects', []).map(iteratee('name')))

function refresh() {
  const [sort, order] = appStore.getSettings('entityList', 'orderBy') ?? ['_score', 'desc']
  entityStore.projects = userProjects.value
  entityStore.query = route.query.q ?? ''
  entityStore.perPage = parseInt(appStore.getSettings('entityList', 'perPage') ?? 25)
  entityStore.sort = sort === '_score' ? null : { [sort]: order }
  return entityStore.search()
}

// The route renders this view and this view asks the store: nothing else triggers the first load.
onMounted(refresh)
// Sort, per-page and the query all travel through the URL, so one watcher covers every one of them.
watch(() => route.query, refresh, { deep: true })

// RowPagination counts pages from one; the store holds an elasticsearch offset.
const page = computed({
  get: () => Math.floor(entityStore.from / entityStore.perPage) + 1,
  set: (value) => {
    entityStore.from = (value - 1) * entityStore.perPage
    entityStore.search()
  }
})
</script>

<template>
  <page-container class="entity">
    <entity-card-placeholder
      v-if="isLoading"
      class="entity__placeholder"
      :properties="PROPERTIES"
      :repeat="3"
    />
    <empty-state
      v-else-if="isErrored"
      :image="searchError"
      :image-dark="searchErrorDark"
      :label="t('entity.errorStateLabel')"
    />
    <empty-state
      v-else-if="isEmpty"
      :image="searchEmpty"
      :image-dark="searchEmptyDark"
      :label="t('entity.emptyStateLabel')"
    />
    <template v-else>
      <div class="entity__entries d-flex flex-column gap-2">
        <entity-card
          v-for="{ hit, project } in entries"
          :key="`${hit._index}/${hit._id}`"
          :entity="hit._source"
          :project="project"
          :properties="PROPERTIES"
        />
      </div>
      <row-pagination
        v-model:page="page"
        class="entity__pagination mt-3"
        :per-page="entityStore.perPage"
        :total-rows="entityStore.total"
      />
    </template>
  </page-container>
</template>
