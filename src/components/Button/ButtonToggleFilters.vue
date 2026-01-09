<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhFunnel from '~icons/ph/funnel'

import { VARIANT } from '@/enums/variants.js'

const active = defineModel('active', { type: Boolean })

const { t } = useI18n()

const toggle = () => {
  active.value = !active.value
}

const variant = computed(() => {
  return active.value ? VARIANT.ACTION : VARIANT.OUTLINE_TERTIARY
})
</script>

<template>
  <button-icon
    class="button-toggle-filters flex-shrink-0"
    :label="t('buttonToggleFilters.label')"
    :icon-left="IPhFunnel"
    :variant="variant"
    @click="toggle"
  />
</template>
