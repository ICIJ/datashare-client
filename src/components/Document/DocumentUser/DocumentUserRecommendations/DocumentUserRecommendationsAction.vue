<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'DocumentUserRecommendationsAction' })
const recommended = defineModel({ type: Boolean })

const { t } = useI18n()

const recommendButtonLabel = t('documentUserRecommendations.markAsRecommended')
const stopRecommendButtonLabel = t('documentUserRecommendations.unmarkAsRecommended')
const buttonLabel = computed(() => {
  return recommended.value ? stopRecommendButtonLabel : recommendButtonLabel
})
const recommendationIcon = 'user-gear'

const variant = computed(() => {
  return recommended.value ? 'action' : 'outline-action'
})
const toggleRecommend = () => {
  recommended.value = !recommended.value
}
</script>

<template>
  <button-icon
    :icon-left="recommendationIcon"
    :variant="variant"
    class="document-user-recommendations-action align-self-end text-nowrap"
    @click="toggleRecommend"
    >{{ buttonLabel }}</button-icon
  >
</template>

<style lang="scss">
.document-user-recommendations-action {
  width: 270px;
}
</style>
