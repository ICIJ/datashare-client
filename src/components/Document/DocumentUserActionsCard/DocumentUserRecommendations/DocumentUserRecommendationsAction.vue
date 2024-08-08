<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'DocumentUserRecommendationsAction' })
const recommended = defineModel({ type: Boolean, default: false })

const { t } = useI18n()

const recommendButtonLabel = t('documentUserRecommendations.markAsRecommended')
const stopRecommendButtonLabel = t('documentUserRecommendations.unmarkAsRecommended')
const buttonLabel = computed(() => {
  return recommended.value ? stopRecommendButtonLabel : recommendButtonLabel
})
const recommendationIcon = 'check'
const stopRecommendIcon = 'x'
const icon = computed(() => {
  return recommended.value ? stopRecommendIcon : recommendationIcon
})
const variant = computed(() => {
  return recommended.value ? 'action' : 'outline-action'
})
function toggleRecommend() {
  recommended.value = !recommended.value
}
</script>

<template>
  <button-icon
    :icon-left="icon"
    :variant="variant"
    class="document-user-recommendations-action align-self-end text-nowrap"
    @click="toggleRecommend"
    >{{ buttonLabel }}</button-icon
  >
</template>

<style lang="scss">
.document-user-recommendations-action {
  width: 270px;
  & .button-icon__label {
    width: 100%;
    text-align: center;
  }
}
</style>
