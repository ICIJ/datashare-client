<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppIcon, ButtonIcon } from '@icij/murmur-next'
import IPhEyeClosed from '~icons/ph/eye-closed'
import IPhEyeClosedFill from '~icons/ph/eye-closed-fill'

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
const iconLeft = computed(() => (visible.value ? IPhEyeClosed : IPhEyeClosedFill))
const noHeader = computed(() => noToggler && noSort)
</script>

<template>
  <header
    v-if="!noHeader"
    class="d-flex justify-content-between align-items-center"
  >
    <span
      v-if="!noSort"
      class="d-inline-flex align-items-center gap-1 text-nowrap text-body-secondary"
    >
      <app-icon><i-ph-sort-descending /></app-icon>
      {{ t('documentUserCommentsList.sortingText') }}
    </span>
    <button-icon
      v-if="!noToggler"
      class="text-nowrap ms-auto p-0"
      variant="outline-link"
      :icon-left="iconLeft"
      :label="displayComments"
      :tooltip-delay="tooltipDelay"
      @click="toggle"
    />
  </header>
</template>
