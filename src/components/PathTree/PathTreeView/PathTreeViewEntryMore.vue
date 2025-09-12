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
  },
  level: {
    type: Number,
    default: 0
  },
})

const { t } = useI18n()

const style = computed(() => ({
  '--level-indent-factor': props.level
}))

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
    :icon-left="PhCaretDown"
    icon-left-variant="primary"
    class="path-tree-view-entry-more shadow-lg text-nowrap"
    variant="outline-tertiary"
    :size="size"
    :style="style"
  >
    <slot>
      {{ t('pathViewEntryMore.label', { nextPageSize, directoriesLeft }, directoriesLeft) }}
    </slot>
  </button-icon>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-more {
  --level-indent-width: #{$spacer};
  --level-indent-factor: 0;

  margin-left: calc(var(--level-indent-width) * var(--level-indent-factor));
  margin-bottom: $spacer;
}
</style>
