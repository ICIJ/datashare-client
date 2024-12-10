<script setup>
import { computed, ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { get } from 'lodash'
import bodybuilder from 'bodybuilder'

import { useCore } from '@/composables/core'
import { useMode } from '@/composables/mode'
import { useDocument } from '@/composables/document'
import { useAuth } from '@/composables/auth'
import { useQueryObserver } from '@/composables/query-observer'
import DocumentUserActions from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActions'
import DocumentUserRecommendations from '@/components/Document/DocumentUser/DocumentUserRecommendations/DocumentUserRecommendations'
import DocumentUserTags from '@/components/Document/DocumentUser/DocumentUserTags/DocumentUserTags'

const store = useStore()
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

const actionHandler = ({ name }) => {
  showTagsCard.value = name === 'tags' && !showTagsCard.value
  showRecommendationsCard.value = name === 'recommendations' && !showRecommendationsCard.value
}

const tags = computed(() => store.state.document.tags)
const allTags = ref([])
const recommendedBy = computed(() => store.state.document.recommendedBy)

const recommended = computed({
  get() {
    return store.state.document.isRecommended
  },
  async set() {
    await store.dispatch('document/toggleAsRecommended', await core.auth.getUsername())
    await store.dispatch('recommended/fetchIndicesRecommendations')
  }
})

const deleteTag = (label) => {
  return store.dispatch('document/deleteTag', { documents: [document.value], label })
}

const addTags = (labels) => {
  return store.dispatch('document/addTags', { documents: [document.value], labels })
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
  <document-user-actions
    :show-recommendations="isServer"
    show-tags
    :tags="tags.length"
    :recommendations="recommendedBy.length"
    @action="actionHandler"
  />
  <teleport v-if="documentViewFloatingElement" :to="documentViewFloatingSelector">
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
  </teleport>
</template>
