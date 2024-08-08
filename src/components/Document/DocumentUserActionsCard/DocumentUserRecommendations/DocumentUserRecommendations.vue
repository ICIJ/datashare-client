<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { uniq } from 'lodash'

import DocumentUserActionsCard from '@/components/Document/DocumentUserActionsCard/DocumentUserActionsCard'
import DocumentUserRecommendationsAction from '@/components/Document/DocumentUserActionsCard/DocumentUserRecommendations/DocumentUserRecommendationsAction'
import DisplayUser from '@/components/Display/DisplayUser'
import SearchParameter from '@/components/Search/SearchParameter/SearchParameter'

defineOptions({ name: 'DocumentUserRecommendations' })
const usernames = defineModel({ type: Array, default: () => [] })

const props = defineProps({
  username: { type: String }
})

const { t } = useI18n()

const title = computed(() => t('documentUserActions.recommended', usernames.value.length))
const warning = t('documentUserRecommendations.warning')
const noRecommendations = t('documentUserRecommendations.noRecommendations')
const recommendationIcon = 'user-gear'

const uniqUsernames = computed(() => {
  return uniq(usernames.value)
})

const recommend = computed(() => {
  return uniqUsernames.value.indexOf(props.username) > 1
})
function onRecommendChange(recommend) {
  if (recommend) {
    usernames.value = [...uniqUsernames.value, props.username]
  } else {
    usernames.value = uniqUsernames.value.filter((u) => u !== props.username)
  }
}
</script>

<template>
  <document-user-actions-card :title="title" :icon="recommendationIcon" show-warning action-end>
    <template #content>
      <div class="d-flex gap-2">
        <display-user
          v-for="(user, index) in usernames"
          :key="index"
          :tag="SearchParameter"
          :icon="recommendationIcon"
          :term="user"
          filter="recommendedBy"
          :value="user"
          class="text-action-emphasis"
        />
      </div>
      <span v-if="!usernames.length">{{ noRecommendations }}</span>
    </template>
    <template #action-warning>{{ warning }}</template>
    <template #action>
      <document-user-recommendations-action
        :model-value="recommend"
        class="d-inline-flex align-self-end"
        @update:modelValue="onRecommendChange"
      />
    </template>
  </document-user-actions-card>
</template>

<style scoped lang="scss"></style>
