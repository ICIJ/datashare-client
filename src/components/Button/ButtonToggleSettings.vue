<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhSlidersHorizontal from '~icons/ph/sliders-horizontal'

const active = defineModel('active', { type: Boolean })

defineProps({
  loading: {
    type: Boolean
  }
})
const { t } = useI18n()

const toggle = () => {
  active.value = !active.value
}
</script>

<template>
  <button-icon
    :icon-left="IPhSlidersHorizontal"
    :label="t('buttonToggleSettings.label')"
    class="button-toggle-settings border-0 flex-shrink-0"
    hide-label
    hide-tooltip
    square
    variant="outline-secondary"
    @click="toggle"
  />
</template>
