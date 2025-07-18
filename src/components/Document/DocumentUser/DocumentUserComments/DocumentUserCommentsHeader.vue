<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhosphorIcon, ButtonIcon } from '@icij/murmur-next'

const visible = defineModel('visible', {
  type: Boolean,
  default: true
})

const { noSort, noToggler } = defineProps({
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  },
  noToggler: {
    type: Boolean,
    default: false
  },
  noSort: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

const toggle = () => (visible.value = !visible.value)

const hideComments = 'documentUserCommentsList.hideComments'
const showComments = 'documentUserCommentsList.showComments'
const displayComments = computed(() => t(visible.value ? hideComments : showComments))
const iconWeight = computed(() => (visible.value ? 'regular' : 'fill'))
const noHeader = computed(() => noToggler && noSort)
</script>

<template>
  <header v-if="!noHeader" class="d-flex justify-content-between align-items-center">
    <span v-if="!noSort" class="d-inline-flex align-items-center gap-1 text-nowrap text-body-secondary">
      <phosphor-icon :name="PhSortDescending" />
      {{ t('documentUserCommentsList.sortingText') }}
    </span>
    <button-icon
      v-if="!noToggler"
      class="text-nowrap ms-auto p-0"
      variant="outline-link"
      :icon-left="PhEyeClosed"
      :icon-left-weight="iconWeight"
      :label="displayComments"
      :tooltip-delay="tooltipDelay"
      @click="toggle"
    />
  </header>
</template>
