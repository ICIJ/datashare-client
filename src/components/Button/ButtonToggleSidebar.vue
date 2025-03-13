<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

const active = defineModel('active', { type: Boolean })

const { t } = useI18n()

const toggle = () => {
  active.value = !active.value
}

const title = computed(() => {
  return active.value ? t('buttonToggleSidebar.expand') : t('buttonToggleSidebar.reduce')
})

const weight = computed(() => {
  return active.value ? 'regular' : 'fill'
})
</script>

<template>
  <button-icon
    tooltip-placement="right"
    :icon-left="PhSidebarSimple"
    :icon-left-weight="weight"
    square
    hide-label
    variant="primary"
    class="button-toggler-sidebar text-white flex-shrink-0"
    :label="title"
    @click="toggle"
  >
    {{ title }}
  </button-icon>
</template>
