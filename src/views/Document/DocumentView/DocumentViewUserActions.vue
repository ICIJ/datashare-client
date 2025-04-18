<script setup>
import { computed, ref, onBeforeMount } from 'vue'
import { get } from 'lodash'
import bodybuilder from 'bodybuilder'

import { useCore } from '@/composables/useCore'
import { useMode } from '@/composables/useMode'
import { useDocument } from '@/composables/useDocument'
import { useAuth } from '@/composables/useAuth'
import { useQueryObserver } from '@/composables/useQueryObserver'
import DocumentUserActions from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActions'
import DocumentUserRecommendations from '@/components/Document/DocumentUser/DocumentUserRecommendations/DocumentUserRecommendations'
import DocumentUserTags from '@/components/Document/DocumentUser/DocumentUserTags/DocumentUserTags'
import Hook from '@/components/Hook/Hook'
import { useRecommendedStore, useDocumentStore } from '@/store/modules'

const recommendedStore = useRecommendedStore()
const documentStore = useDocumentStore()
const { core } = useCore()
const { isServer } = useMode()
const { document, injectDocumentViewFloatingId } = useDocument()
const { username } = useAuth()
const { querySelector } = useQueryObserver()

const documentViewFloatingId = injectDocumentViewFloatingId()
const documentViewFloatingSelector = `#${documentViewFloatingId}`
const documentViewFloatingElement = querySelector(documentViewFloatingSelector)

const showRecommendationsCard = ref(false)
const showTagsCard = ref(false)

const actionHandler = (name) => {
  showTagsCard.value = name === 'tags' && !showTagsCard.value
  showRecommendationsCard.value = name === 'recommendations' && !showRecommendationsCard.value
}

const tags = computed(() => documentStore.tags)
const allTags = ref([])
const recommendedBy = computed(() => documentStore.recommendedBy)

const recommended = computed({
  get() {
    return documentStore.isRecommended
  },
  async set() {
    await documentStore.toggleAsRecommended(await core.auth.getUsername())
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

onBeforeMount(fetchAllTags)
</script>

<template>
  <hook name="document:user-actions:before" :bind="{ document }" />
  <document-user-actions
    :show-recommendations="isServer"
    show-tags
    :tags="tags.length"
    :recommendations="recommendedBy.length"
    @action="actionHandler"
  />
  <hook name="document:user-actions:after" :bind="{ document }" />
  <teleport :disabled="!documentViewFloatingElement" :to="documentViewFloatingSelector">
    <hook name="document:user-actions-cards:before" :bind="{ document }" />
    <document-user-recommendations
      v-model="showRecommendationsCard"
      v-model:recommended="recommended"
      :recommended-by="recommendedBy"
    />
    <document-user-tags
      v-model="showTagsCard"
      :is-server="isServer"
      :username="username"
      :tags="tags"
      :all-tags="allTags"
      @delete="deleteTag"
      @add="addTags"
    />
    <hook name="document:user-actions-cards:after" :bind="{ document }" />
  </teleport>
</template>
