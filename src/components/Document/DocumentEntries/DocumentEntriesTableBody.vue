<script setup>
import { useI18n } from 'vue-i18n'

import { useSelection } from '@/composables/useSelection'
import DocumentRow from '@/components/Document/DocumentRow/DocumentRow'
import DocumentRowPlaceholder from '@/components/Document/DocumentRow/DocumentRowPlaceholder'

const selection = defineModel('selection', { type: Array, default: () => [] })
const { selectionValues } = useSelection(selection)

defineProps({
  entries: {
    type: Array
  },
  compactBreakpoint: {
    type: String,
    default: 'md'
  },
  selectMode: {
    type: Boolean,
    default: false
  },
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail']
  },
  loading: {
    type: Boolean,
    default: false
  }
})
const { t } = useI18n()
</script>

<template>
  <template v-if="loading">
    <document-row-placeholder
      :properties="properties"
      :repeat="5"
    />
  </template>
  <template v-else-if="entries.length">
    <document-row
      v-for="entry in entries"
      v-memo="[entry.id, selectionValues[entry.id]]"
      :key="entry.id"
      v-model:selected="selectionValues[entry.id]"
      :document="entry"
      :properties="properties"
      :select-mode="selectMode"
    />
  </template>
  <template v-else>
    <tr>
      <td
        class="p-3 text-secondary text-center"
        :colspan="properties.length + 1"
      >
        {{ t('documentEntries.noMatches') }}
      </td>
    </tr>
  </template>
</template>
