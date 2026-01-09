<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhEyesFill from '~icons/ph/eyes-fill'

const active = defineModel('active', { type: Boolean })

const toggle = () => {
  active.value = !active.value
}

const { t } = useI18n()

const label = computed(() => {
  if (active.value) {
    return t('buttonToggleRecommendation.unmark')
  }
  return t('buttonToggleRecommendation.mark')
})
</script>

<template>
  <button-icon
    variant="action"
    :icon-left="IPhEyesFill"
    class="button-toggler-recommendation"
    :label="label"
    @click="toggle"
  />
</template>
