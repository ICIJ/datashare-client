<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String
  },
  emphasis: {
    type: Boolean
  },
  hideLabel: {
    type: Boolean
  },
  compact: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'page-table-th--emphasis': props.emphasis,
    'page-table-th--compact': props.hideLabel
  }
})

const labelClassList = computed(() => {
  return {
    'visually-hidden': props.hideLabel
  }
})
</script>

<template>
  <b-th class="page-table-th text-nowrap" :class="classList">
    <slot>
      <phosphor-icon v-if="icon" :name="icon" class="me-1" />
      <span :class="labelClassList">{{ label }}</span>
    </slot>
  </b-th>
</template>

<style lang="scss" scoped>
.page-table-th--compact {
  width: 2rem;
}
</style>
