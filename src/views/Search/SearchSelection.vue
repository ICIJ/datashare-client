<script setup>
import { computed } from 'vue'
import { property } from 'lodash'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/core'
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

const selectionEntries = computed(() => props.entries.filter(({ id }) => isSelected(id)))
const count = computed(() => selection.value.length)
const all = computed(() => props.entries.map(property('id')))

const { selectAll, unselectAll, isSelected, indeterminate } = useSelection(selection, all)

const selected = computed({
  get: () => count.value === props.entries.length,
  set: (value) => (value ? selectAll() : unselectAll())
})

const { breakpointDown } = useBreakpoints()
const isCompact = computed(() => breakpointDown.value[props.compactAutoBreakpoint] || props.compact)

const store = useStore()
const { toastedPromise } = useCore()
const { t } = useI18n()

const starSelection = async () => {
  const successMessage = t('document.starred')
  return toastedPromise(store.dispatch('starred/starDocuments', selectionEntries.value), { successMessage })
}

const unstarSelection = async () => {
  const successMessage = t('document.unstarred')
  return toastedPromise(store.dispatch('starred/unstarDocuments', selectionEntries.value), { successMessage })
}
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
        @click="starSelection"
      />
    </template>
    <button-icon :label="$t('searchSelection.unstar')" icon-left="star" @click="unstarSelection" />
    <button-icon :label="$t('searchSelection.tag')" icon-left="hash" />
  </form-actions>
</template>
