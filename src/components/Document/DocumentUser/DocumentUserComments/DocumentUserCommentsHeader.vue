<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhosphorIcon } from '@icij/murmur-next'

import ButtonIcon from '@/components/Button/ButtonIcon'

const { t } = useI18n()

const visible = defineModel('visible', {
  type: Boolean,
  default: true
})

defineProps({
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})

const toggle = () => (visible.value = !visible.value)

const hideComments = 'documentUserCommentsList.hideComments'
const showComments = 'documentUserCommentsList.showComments'
const displayComments = computed(() => t(visible.value ? hideComments : showComments))
const iconWeight = computed(() => (visible.value ? 'regular' : 'fill'))
</script>

<template>
  <header class="d-flex justify-content-between align-items-center">
    <span class="d-inline-flex align-items-center gap-1 text-nowrap text-body-secondary">
      <phosphor-icon :name="PhSortDescending" />
      {{ $t('documentUserCommentsList.sortingText') }}
    </span>
    <button-icon
      class="text-nowrap"
      variant="outline-link"
      :icon-left="PhEyeClosed"
      :icon-left-weight="iconWeight"
      :label="displayComments"
      :tooltip-delay="tooltipDelay"
      @click="toggle"
    />
  </header>
</template>
