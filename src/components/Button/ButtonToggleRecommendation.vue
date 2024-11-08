<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

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
    icon-left="eyes"
    icon-left-weight="fill"
    class="button-toggler-recommendation text-white"
    :label="label"
    @click="toggle"
  />
</template>
