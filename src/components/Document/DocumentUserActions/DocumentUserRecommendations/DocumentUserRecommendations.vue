<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import DocumentUserActionsCard from '@/components/Document/DocumentUserActions/DocumentUserActionsCard'
import DisplayUser from '@/components/Display/DisplayUser'
import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'DocumentUserRecommendations' })
const props = defineProps({
  usernames: { type: Array, default: () => [] }
})

const { t } = useI18n()

const title = computed(() => t('documentUserActions.recommended', props.usernames.length))
const warning = t('documentUserRecommendations.warning')
const noRecommendations = t('documentUserRecommendations.noRecommendations')
const recommendButtonLabel = t('documentUserRecommendations.recommendButtonLabel')
const recommendationIcon = 'user-gear'
</script>

<template>
  <document-user-actions-card :title="title" :icon="recommendationIcon" show-warning>
    <template #content>
      <display-user v-for="(user, index) in usernames" :key="index" :value="user" class="me-3" />
      <span v-if="!usernames.length">{{ noRecommendations }}</span>
    </template>
    <template #footer-warning>{{ warning }}</template>
    <template #footer>
      <button-icon :icon-left="recommendationIcon" variant="action">{{ recommendButtonLabel }}</button-icon>
    </template>
  </document-user-actions-card>
</template>

<style scoped lang="scss"></style>
