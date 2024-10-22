<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhCards, PhX } from '@phosphor-icons/vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { VARIANT } from '@/enums/variants'

const active = defineModel('active', { type: Boolean })

const toggle = () => {
  active.value = !active.value
}

const { t } = useI18n()

const variant = computed(() => {
  return active.value ? VARIANT.ACTION : VARIANT.OUTLINE_ACTION
})

const label = computed(() => {
  return active.value ? t('buttonToggleBatchMode.labelSingleFlow') : t('buttonToggleBatchMode.labelBatchMode')
})

const icon = computed(() => {
  return active.value ? PhX : PhCards
})
</script>

<template>
  <button-icon
    class="button-toggle-batch-mode"
    :label="label"
    :icon-left="icon"
    :variant="variant"
    square
    hide-label
    @click="toggle"
  />
</template>
