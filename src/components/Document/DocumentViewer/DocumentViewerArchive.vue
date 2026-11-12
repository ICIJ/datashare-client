<script setup>
import { computed, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DocumentViewerArchiveFolder from '@/components/Document/DocumentViewer/DocumentViewerArchiveFolder'
import PathTreeView from '@/components/PathTree/PathTreeView/PathTreeView'
import { MAX_ARCHIVE_DOCUMENTS, useArchiveDocuments } from '@/composables/useArchiveDocuments'
import { useArchiveFolders } from '@/composables/useArchiveFolders'
import { useArchiveHighlights } from '@/composables/useArchiveHighlights'
import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { findArchiveMatches, toArchiveTree } from '@/utils/archiveTree'

const MAILBOX_CONTENT_TYPES = ['application/mbox', 'application/vnd.ms-outlook-pst']

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const viewer = useTemplateRef('viewer')

const { archiveKey, documents, total, isLoading, hasError } = useArchiveDocuments(() => props.document)

const isMailbox = computed(() => MAILBOX_CONTENT_TYPES.some(type => props.document.contentType.startsWith(type)))
const tree = computed(() => toArchiveTree(documents.value, { isMailbox: isMailbox.value }))
const isEmpty = computed(() => !isLoading.value && !hasError.value && total.value === 0)
const isOverLimit = computed(() => total.value > MAX_ARCHIVE_DOCUMENTS)

function findMatches(term) {
  return findArchiveMatches(tree.value, term).map(match => ({ page: 1, ...match }))
}

const { term, activeIndex, appliedTerm, matches, occurrences, isLoading: isSearching, refresh } = useDocumentLocalSearch({ findMatches })
const activeMatch = computed(() => matches.value[activeIndex.value - 1] ?? null)

const { openPaths, activeKeys, activeKey, limits, toggle, showMore, revealActiveMatch } = useArchiveFolders({ tree, activeMatch, root: viewer })

useArchiveHighlights({ root: viewer, term: appliedTerm, activeKey, repaintOn: [openPaths, limits, tree] })

watch(documents, refresh)
</script>
<template>
  <div
    ref="viewer"
    class="document-viewer-archive"
  >
    <document-toolbox
      v-model="term"
      v-model:active-index="activeIndex"
      :document="document"
      :occurrences="occurrences"
      :loading="isSearching"
      no-count
      @reactivate="revealActiveMatch"
    />
    <div
      v-if="hasError"
      class="text-center py-3"
    >
      {{ t('documentViewerArchive.error') }}
    </div>
    <div
      v-else-if="isEmpty"
      class="text-center py-3"
    >
      {{ t('documentViewerArchive.empty') }}
    </div>
    <div
      v-else
      class="py-3"
    >
      <p
        v-if="isOverLimit"
        class="text-muted"
      >
        {{ t('documentViewerArchive.limit', { n: MAX_ARCHIVE_DOCUMENTS, total }) }}
      </p>
      <path-tree-view
        no-label
        no-search
        :is-loading="isLoading"
      >
        <document-viewer-archive-folder
          :key="archiveKey"
          :folder="tree"
          :open-paths="openPaths"
          :limits="limits"
          :active-keys="activeKeys"
          root
          @toggle="toggle"
          @more="showMore"
        />
      </path-tree-view>
    </div>
  </div>
</template>

<style lang="scss">
::highlight(archive-search-term) {
  background-color: $mark-bg;
  color: black;
}

::highlight(archive-search-term-active) {
  background-color: #38d878;
  color: black;
}
</style>
