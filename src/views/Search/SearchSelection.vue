<script setup>
import { computed } from 'vue'
import { property } from 'lodash'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'
import { useSearchStore, useStarredStore, useDocumentStore } from '@/store/modules'
import { useSelection } from '@/composables/useSelection'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'
import ButtonIcon from '@/components/Button/ButtonIcon'
import FormActions from '@/components/Form/FormActions/FormActions'
import { usePromptModal } from '@/composables/usePromptModal'
import SearchSelectionAddTagsModal from '@/views/Search/SearchSelectionAddTagsModal'

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

const starredStore = useStarredStore()
const searchStore = useSearchStore()
const documentStore = useDocumentStore()
const { toastedPromise } = useCore()
const { t } = useI18n()
const nbSelection = computed(() => {
  return selectionEntries.value.length
})
const noSelection = computed(() => {
  return nbSelection.value === 0
})
const starSelection = async () => {
  return toastedPromise(starredStore.starDocuments(selectionEntries.value), { successMessage: t('document.starred') })
}
const { prompt: showAddTagsModal } = usePromptModal(SearchSelectionAddTagsModal)
async function addTagsModal() {
  const indices = searchStore.indices
  const result = await showAddTagsModal({ indices, nbDocs: nbSelection.value })
  // Only a valid submit returns value. Cancel or modal hide returns null.
  if (result?.tags) {
    await toastedPromise(tagSelection(selectionEntries.value, result.tags), {
      successMessage: t('searchSelection.tagSuccess', { nbTags: result.tags.length, nbDocs: nbSelection.value }),
      errorMessage: t('searchSelection.tagFailed', { nbTags: result.tags.length, nbDocs: nbSelection.value })
    })
  }
}

const tagSelection = async (documents, labels) => {
  return documentStore.addTags({ documents, labels })
}
</script>

<template>
  <form-actions
    class="search-selection px-3 flex-shrink-1"
    variant="outline-tertiary"
    compact-variant="outline-tertiary"
    :compact="compact"
    compact-auto
  >
    <template #start>
      <b-form-checkbox
        v-model="selected"
        v-model:indeterminate="indeterminate"
        :wrapper-attrs="{ class: 'search-selection__form-checkbox' }"
      >
        {{ $tc('searchSelection.count', count, { count: $n(count) }) }}
      </b-form-checkbox>
    </template>
    <template #compact>
      <button-icon
        :label="$t('searchSelection.star')"
        icon-left="star"
        class="flex-shrink-0"
        :disabled="noSelection"
        :hide-label="isCompact"
        :square="isCompact"
        @click="starSelection"
      />
    </template>
    <button-icon :label="$t('searchSelection.tag')" icon-left="hash" :disabled="noSelection" @click="addTagsModal" />
  </form-actions>
</template>

<style lang="scss" scoped>
.search-selection {
  min-width: 0;

  &__form-checkbox {
    min-width: 0;
    flex-shrink: 1;
    justify-content: center;
    margin: 0;
    display: flex;

    &:deep(.form-check-input) {
      margin-right: 0.5rem;
    }

    &:deep(.form-check-label) {
      flex-shrink: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      justify-content: center;
    }
  }
}
</style>
