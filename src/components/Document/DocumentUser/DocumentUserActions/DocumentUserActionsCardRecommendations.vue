<script setup>
import { computed } from 'vue'

import DocumentUserActionsCard from './DocumentUserActionsCard'
import DocumentUserActionsCardInfo from './DocumentUserActionsCardInfo'

import ButtonRecommendation from '@/components/Button/ButtonRecommendation'
import ButtonToggleRecommendation from '@/components/Button/ButtonToggleRecommendation'

const modelValue = defineModel({ type: Boolean, default: true })
const recommended = defineModel('recommended', { type: Boolean, default: true })

const { recommendedBy } = defineProps({
  recommendedBy: {
    type: Array,
    default: () => []
  }
})

const count = computed(() => recommendedBy.length)
</script>

<template>
  <document-user-actions-card
    v-model="modelValue"
    :title="$t('documentUserActionsCardRecommendations.title', { count })"
    icon="eyes"
    icon-weight="fill"
  >
    <div v-if="count" class="d-flex gap-2">
      <button-recommendation v-for="user in recommendedBy" :key="user" :label="user" />
    </div>
    <footer class="d-flex flex-column gap-3">
      <document-user-actions-card-info>
        {{ $t('documentUserActionsCardRecommendations.info') }}
      </document-user-actions-card-info>
      <div class="text-end">
        <button-toggle-recommendation v-model:active="recommended" />
      </div>
    </footer>
  </document-user-actions-card>
</template>
