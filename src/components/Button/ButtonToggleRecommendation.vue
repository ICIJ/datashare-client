<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

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
    :icon-left="PhEyes"
    icon-left-weight="fill"
    class="button-toggler-recommendation"
    :label="label"
    @click="toggle"
  />
</template>
