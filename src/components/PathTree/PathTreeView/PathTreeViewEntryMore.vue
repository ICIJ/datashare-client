<script setup>
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

const props = defineProps({
  page: {
    type: Number,
    default: 1
  },
  perPage: {
    type: Number,
    default: 25
  },
  total: {
    type: Number,
    default: 0
  },
  compact: {
    type: Boolean,
    default: null
  }
})

const { t } = useI18n()
const nextPageSize = computed(() => {
  return Math.min(props.perPage, props.total - props.page * props.perPage)
})

const directoriesLeft = computed(() => {
  return Math.max(0, props.total - props.page * props.perPage)
})

const compactOrInjected = computed(() => props.compact ?? inject('compact', false))
const size = computed(() => (compactOrInjected.value ? 'sm' : 'md'))
</script>

<template>
  <button-icon
    v-if="directoriesLeft > 0"
    :icon-left="PhCaretDown"
    icon-left-variant="primary"
    class="shadow-lg text-nowrap"
    variant="outline-tertiary"
    :size="size"
  >
    <slot>
      {{ t('pathViewEntryMore.label', { nextPageSize, directoriesLeft }, directoriesLeft) }}
    </slot>
  </button-icon>
</template>
