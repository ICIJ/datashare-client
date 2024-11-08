<script setup>
import { computed } from 'vue'

import ButtonToggleRecommendation from '@/components/Button/ButtonToggleRecommendation'
import DocumentUserActionsCard from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsCard'

defineOptions({ name: 'DocumentUserRecommendations' })

const modelValue = defineModel({ type: Boolean, default: false })
const recommended = defineModel('recommended', { type: Boolean, default: false })

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
    :title="$t('documentUserActions.recommendations', count)"
    icon="eyes"
    icon-weight="fill"
    show-warning
    action-end
  >
    <div v-if="count" class="d-flex gap-2 flex-wrap align-items-top">
      <button-recommendation v-for="user in recommendedBy" :key="user" :label="user" />
    </div>
    <template #action-warning>
      {{ $t('documentUserRecommendations.warning') }}
    </template>
    <template #action>
      <button-toggle-recommendation v-model:active="recommended" class="align-self-end" />
    </template>
  </document-user-actions-card>
</template>
