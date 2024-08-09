<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import LineActionButton from '@/components/Button/LineActionButton'
import ButtonIcon from '@/components/Button/ButtonIcon'
defineOptions({ name: 'BatchSearchCardActions' })
const props = defineProps({
  uuid: { type: String },
  nbResults: { type: Number },
  projects: { type: Array }
})
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
const downloadLabel = t('batchSearchCard.downloadLabel', { n: props.nbResults })
const indices = computed(() => {
  return props.projects.join(',')
})
const to = { name: 'batch-tasks.view.results', params: { indices: indices.value, uuid: props.uuid } }
const launchDownload = () => {
  alert('Launch download uuid: ' + props.uuid)
}
</script>

<template>
  <div class="batch-search-card-actions d-flex flex-column gap-4">
    <div class="d-flex flex-wrap gap-2">
      <line-action-button
        v-for="(action, index) in actions"
        :key="index"
        :icon="action.icon"
        @click="$emit(action.event, { uuid })"
        >{{ action.label }}</line-action-button
      >
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
        icon-left="download-simple"
        variant="outline-primary"
        class="batch-search-card-actions__download text-nowrap"
        @click="launchDownload"
        >{{ downloadLabel }}</button-icon
      >
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
