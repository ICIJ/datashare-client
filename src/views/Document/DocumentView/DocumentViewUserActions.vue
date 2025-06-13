<script setup>
import { computed, ref, onBeforeMount, watch } from 'vue'
import { get } from 'lodash'
import bodybuilder from 'bodybuilder'

import { DOCUMENT_USER_ACTIONS } from '@/enums/documentUserActions'
import { useCore } from '@/composables/useCore'
import { useMode } from '@/composables/useMode'
import { useDocument } from '@/composables/useDocument'
import { useAuth } from '@/composables/useAuth'
import { useElementObserver } from '@/composables/useElementObserver'
import DocumentUserActions from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActions'
import DocumentUserRecommendations from '@/components/Document/DocumentUser/DocumentUserRecommendations/DocumentUserRecommendations'
import DocumentUserTags from '@/components/Document/DocumentUser/DocumentUserTags/DocumentUserTags'
import Hook from '@/components/Hook/Hook'
import { useRecommendedStore, useDocumentStore } from '@/store/modules'

const recommendedStore = useRecommendedStore()
const documentStore = useDocumentStore()
const { core } = useCore()
const { isServer } = useMode()
const { document, documentViewFloatingSelector } = useDocument()
const { username } = useAuth()
const { waitForElementCreated } = useElementObserver()

const showRecommendationsCard = computed(() => documentStore.isUserActionVisible(DOCUMENT_USER_ACTIONS.RECOMMENDATIONS))
const showTagsCard = computed(() => documentStore.isUserActionVisible(DOCUMENT_USER_ACTIONS.TAGS))
const hasFloatingElement = ref(false)

const tags = computed(() => documentStore.tags)
const allTags = ref([])
const recommendedBy = computed(() => documentStore.recommendedBy)

const recommended = computed({
  get() {
    return documentStore.isRecommended
  },
  async set() {
    await documentStore.toggleAsRecommended(username.value)
    await recommendedStore.fetchIndexRecommendations(documentStore.document.index)
  }
})

const deleteTag = (label) => {
  return documentStore.deleteTag({ documents: [document.value], label })
}

const addTags = (labels) => {
  return documentStore.addTags({ documents: [document.value], labels })
}

const fetchAllTags = async () => {
  const index = document.value.index
  const body = bodybuilder().size(0).agg('terms', 'tags').build()
  const response = await core.api.elasticsearch.search({ index, body })
  const buckets = get(response, 'aggregations.agg_terms_tags.buckets', [])
  allTags.value = buckets.map(({ key: label }) => ({ label }))
}

const waitForFloatingElement = async () => {
  hasFloatingElement.value = false
  if (documentViewFloatingSelector.value) {
    hasFloatingElement.value = !!(await waitForElementCreated(documentViewFloatingSelector.value))
  }
}

watch(documentViewFloatingSelector, waitForFloatingElement, { immediate: true })

onBeforeMount(fetchAllTags)
</script>

<template>
  <document-user-actions
    show-tags
    :show-recommendations="isServer"
    :active-recommendations="showRecommendationsCard"
    :active-tags="showTagsCard"
    :tags="tags.length"
    :recommendations="recommendedBy.length"
    @action="documentStore.toggleUserAction"
  />
  <teleport v-if="hasFloatingElement" :to="documentViewFloatingSelector">
    <hook name="document-user-actions-cards:before" :bind="{ document }" />
    <document-user-tags
      v-model="showTagsCard"
      :is-server="isServer"
      :username="username"
      :tags="tags"
      :all-tags="allTags"
      @delete="deleteTag"
      @add="addTags"
    />
    <document-user-recommendations
      v-model="showRecommendationsCard"
      v-model:recommended="recommended"
      :recommended-by="recommendedBy"
    />
    <hook name="document-user-actions-cards:after" :bind="{ document }" />
  </teleport>
</template>
