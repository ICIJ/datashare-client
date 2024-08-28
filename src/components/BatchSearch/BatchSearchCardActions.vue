<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'BatchSearchCardActions' })

const props = defineProps({
  uuid: { type: String },
  nbDocuments: { type: Number },
  nbQueries: { type: Number },
  projects: { type: Array }
})

const emit = defineEmits(['downloadDocuments', 'downloadQueries', 'downloadQueriesWithoutResults'])
const { t } = useI18n()

const actions = {
  renameAction: {
    event: 'rename',
    label: t('batchSearchCardActions.rename'),
    icon: 'pencil-simple'
  },
  editAction: {
    // TODO CD: very similar to rename.
    event: 'edit',
    label: t('batchSearchCardActions.edit'),
    icon: 'pencil-simple'
  },
  relaunchAction: {
    event: 'relaunch',
    label: t('batchSearchCardActions.relaunch'),
    icon: 'arrow-clockwise'
  },
  deleteAction: {
    event: 'delete',
    label: t('batchSearchCardActions.delete'),
    icon: 'trash'
  }
}

const seeAllDocumentsLabel = t('batchSearchCard.seeAllDocuments')
const downloadDocumentsLabel = t('batchSearchCard.downloadDocumentsLabel', { n: props.nbDocuments })
const noDocuments = computed(() => {
  return props.nbDocuments === 0
})
const noDocumentsLabel = t('batchSearchCard.seeAllDocuments')

const downloadQueriesLabel = t('batchSearchCard.downloadQueriesLabel', { n: props.nbQueries })
const downloadQueriesWithoutResultsLabel = t('batchSearchCard.downloadQueriesWithoutResultsLabel')

const indices = computed(() => {
  return props.projects.join(',')
})
const to = { name: 'batch-tasks.view.results', params: { indices: indices.value, uuid: props.uuid } }
const downloadDocuments = () => {
  emit('downloadDocuments')
}
const downloadQueries = () => {
  emit('downloadQueries')
}
const downloadQueriesWithoutResults = () => {
  emit('downloadQueriesWithoutResults')
}
</script>

<template>
  <div class="batch-search-card-actions d-flex flex-column gap-4">
    <div class="d-flex flex-wrap gap-2">
      <button-icon
        v-for="(action, index) in actions"
        :key="index"
        :icon-left="action.icon"
        :label="action.label"
        size="sm"
        variant="outline-secondary"
        class="border-0"
        @click="$emit(action.event, { uuid })"
      />
    </div>
    <div class="d-inline-flex flex-sm-row flex-column">
      <button-icon
        icon-left="list"
        icon-right="caret-right"
        variant="action"
        class="batch-search-card-actions__see-all flex-shrink-1"
        :to="to"
        >{{ seeAllDocumentsLabel }}</button-icon
      >
    </div>
    <div class="d-inline-flex flex-sm-row flex-column">
      <button-icon
        :disabled="noDocuments"
        icon-left="download-simple"
        variant="outline-primary"
        class="batch-search-card-actions__download text-nowrap"
        @click="downloadDocuments"
        >{{ noDocuments ? noDocumentsLabel : downloadDocumentsLabel }}</button-icon
      >
    </div>
    <div class="d-inline-flex flex-sm-row flex-column">
      <button-icon
        icon-left="download-simple"
        variant="outline-primary"
        class="d-inline-flex flex-nowrap"
        @click="downloadQueries"
      >
        <span>{{ downloadQueriesLabel }}</span>
      </button-icon>
      <button-icon
        icon-left="download-simple"
        variant="outline-primary"
        class="d-inline-flex flex-nowrap"
        @click="downloadQueriesWithoutResults"
      >
        <span>{{ downloadQueriesWithoutResultsLabel }}</span>
      </button-icon>
    </div>
  </div>
</template>
<style lang="scss">
.batch-search-card-actions {
  &__see-all {
    justify-content: space-between;
  }
  &__download {
    justify-content: center;
  }
}
</style>
