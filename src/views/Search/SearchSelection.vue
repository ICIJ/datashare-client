<script setup>
import { computed } from 'vue'
import { property } from 'lodash'

import { useSelection } from '@/composables/selection'
import { useBreakpoints } from '@/composables/breakpoints'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'
import ButtonIcon from '@/components/Button/ButtonIcon'
import FormActions from '@/components/Form/FormActions/FormActions'

const selection = defineModel('selection', { type: Array, default: () => [] })

const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  },
  selectMode: {
    type: Boolean
  },
  compact: {
    type: Boolean
  },
  compactAuto: {
    type: Boolean
  },
  compactAutoBreakpoint: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  }
})

const count = computed(() => selection.value.length)
const all = computed(() => props.entries.map(property('id')))

const { selectAll, unselectAll, indeterminate } = useSelection(selection, all)

const selected = computed({
  get: () => count.value === props.entries.length,
  set: (value) => (value ? selectAll() : unselectAll())
})

const { breakpointDown } = useBreakpoints()
const isCompact = computed(() => breakpointDown.value[props.compactAutoBreakpoint] || props.compact)
</script>

<template>
  <form-actions v-if="selectMode" class="search-selection" variant="outline-tertiary" :compact="compact" compact-auto>
    <template #start>
      <b-form-checkbox v-model="selected" v-model:indeterminate="indeterminate">
        {{ $tc('searchSelection.count', count, { count: $n(count) }) }}
      </b-form-checkbox>
    </template>
    <template #compact>
      <button-icon
        :label="$t('searchSelection.star')"
        icon-left="star"
        icon-left-weight="fill"
        :hide-label="isCompact"
        :square="isCompact"
      />
    </template>
    <button-icon :label="$t('searchSelection.unstar')" icon-left="star" />
    <button-icon :label="$t('searchSelection.tag')" icon-left="hash" />
  </form-actions>
</template>
