<script setup>
import { computed, ref, watch } from 'vue'

import { useAuth } from '@/composables/useAuth'
import { useElementObserver } from '@/composables/useElementObserver'
import { useElasticSearchQuery } from '@/composables/useElasticSearchQuery'
import { useDocument } from '@/composables/useDocument'
import { useMode } from '@/composables/useMode'
import { DOCUMENT_USER_ACTIONS } from '@/enums/documentUserActions'
import DocumentUserActions from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActions'
import DocumentUserRecommendations from '@/components/Document/DocumentUser/DocumentUserRecommendations/DocumentUserRecommendations'
import DocumentUserTags from '@/components/Document/DocumentUser/DocumentUserTags/DocumentUserTags'
import Hook from '@/components/Hook/Hook'
import { useRecommendedStore, useDocumentStore } from '@/store/modules'

defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

const recommendedStore = useRecommendedStore()
const documentStore = useDocumentStore()
const { isServer } = useMode()
const { document, documentViewFloatingSelector } = useDocument()
const { username } = useAuth()
const { waitForElementCreated } = useElementObserver()

const showRecommendationsCard = computed({
  get: () => documentStore.isUserActionVisible(DOCUMENT_USER_ACTIONS.RECOMMENDATIONS),
  set: value => documentStore.toggleUserAction(DOCUMENT_USER_ACTIONS.RECOMMENDATIONS, value)
})

const showTagsCard = computed({
  get: () => documentStore.isUserActionVisible(DOCUMENT_USER_ACTIONS.TAGS),
  set: value => documentStore.toggleUserAction(DOCUMENT_USER_ACTIONS.TAGS, value)
})

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

const { fetchAllTagsByIndex } = useElasticSearchQuery()

const waitForFloatingElement = async () => {
  hasFloatingElement.value = false
  if (documentViewFloatingSelector.value) {
    hasFloatingElement.value = !!(await waitForElementCreated(documentViewFloatingSelector.value))
  }
}

watch(documentViewFloatingSelector, waitForFloatingElement, { immediate: true })

watch(() => document.value, async () => {
  if (document.value?.index) {
    allTags.value = await fetchAllTagsByIndex(document.value.index)
  }
})

</script>

<template>
  <document-user-actions
    :compact="compact"
    show-tags
    :show-recommendations="isServer"
    :active-recommendations="showRecommendationsCard"
    :active-tags="showTagsCard"
    :tags="tags.length"
    :recommendations="recommendedBy.length"
    @action="documentStore.toggleUserAction"
  >
    <teleport
      v-if="hasFloatingElement"
      :to="documentViewFloatingSelector"
    >
      <hook
        name="document-user-actions-cards:before"
        :bind="{ document }"
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
      <document-user-recommendations
        v-model="showRecommendationsCard"
        v-model:recommended="recommended"
        :recommended-by="recommendedBy"
      />
      <hook
        name="document-user-actions-cards:after"
        :bind="{ document }"
      />
    </teleport>
  </document-user-actions>
</template>
