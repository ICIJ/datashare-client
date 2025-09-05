<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useProjectDeletionModal } from '@/composables/useProjectDeletionModal'
import { useProjectPinned } from '@/composables/useProjectPinned'
import ButtonRowActionEdit from '@/components/Button/ButtonRowAction/ButtonRowActionEdit'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import ButtonTogglePin from '@/components/Button/ButtonTogglePin'
import ModeLocalOnly from '@/components/Mode/ModeLocalOnly'

const { project } = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const { show: showProjectDeletionModal } = useProjectDeletionModal(project)
const { pinned } = useProjectPinned(project)

const toProjectEdit = computed(() => ({
  name: 'project.view.edit',
  params: {
    name: project.name
  }
}))
</script>

<template>
  <div class="project-actions d-flex gap-2">
    <slot>
      <mode-local-only>
        <button-row-action-edit
          :label="t('projectRowActions.edit')"
          :to="toProjectEdit"
        />
        <button-row-action-delete
          :label="t('projectRowActions.delete')"
          @click="showProjectDeletionModal"
        />
      </mode-local-only>
      <button-toggle-pin v-model:active="pinned" />
    </slot>
  </div>
</template>
