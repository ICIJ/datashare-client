<script setup>
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDocumentEntryMemo } from '@/composables/useDocumentEntryMemo'
import { useSelection } from '@/composables/useSelection'
import DocumentRow from '@/components/Document/DocumentRow/DocumentRow'
import DocumentRowPlaceholder from '@/components/Document/DocumentRow/DocumentRowPlaceholder'

const selection = defineModel('selection', { type: Array, default: () => [] })
const { selectionValues } = useSelection(selection)

const props = defineProps({
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
const { addProperties, addSelectMode, getMemoKey } = useDocumentEntryMemo()
addProperties(toRef(props, 'properties'))
addSelectMode(toRef(props, 'selectMode'))
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
      :key="entry.id"
      v-model:selected="selectionValues[entry.id]"
      v-memo="getMemoKey(entry, selectionValues[entry.id])"
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
