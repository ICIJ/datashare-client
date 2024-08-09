<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhCheckSquare, PhMinusSquare, PhSquare } from '@phosphor-icons/vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  selected: {
    type: Boolean
  },
  indeterminate: {
    type: Boolean
  },
  count: {
    type: Number,
    default: 0
  }
})

const icon = computed(() => {
  if (props.indeterminate) {
    return PhMinusSquare
  }

  if (props.selected) {
    return PhCheckSquare
  }

  return PhSquare
})

const variant = computed(() => {
  return props.selected && !props.indeterminate ? 'action' : null
})

const label = computed(() => {
  const { t, n } = useI18n()
  const count = n(props.count)

  if (props.indeterminate || props.selected) {
    return t('searchResultsActions.deselectAll', { count })
  }

  return t('searchResultsActions.selectAll', { count })
})

const emit = defineEmits(['update:selected', 'update:indeterminate'])

const toggle = () => {
  if (props.indeterminate) {
    emit('update:indeterminate', false)
    emit('update:selected', false)
  } else {
    emit('update:selected', !props.selected)
  }
}
</script>

<template>
  <button-icon truncate :icon-left="icon" :variant="variant" :label="label" @click="toggle" />
</template>
