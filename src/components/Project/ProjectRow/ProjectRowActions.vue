<script setup>
import { computed } from 'vue'

import { useProjectDeletionModal, useProjectPinned } from '@/composables/project'
import ButtonIcon from '@/components/Button/ButtonIcon'
import ButtonTogglePin from '@/components/Button/ButtonTogglePin'

const { project } = defineProps({
  project: {
    type: Object,
    required: true
  }
})

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
  <td class="project-row-actions">
    <div class="d-flex gap-2">
      <slot>
        <button-icon
          :to="toProjectEdit"
          icon-left="pencil"
          icon-left-hover-weight="bold"
          hide-label
          square
          size="sm"
          variant="outline-secondary"
          :label="$t('projectRowActions.edit')"
        />
        <button-icon
          icon-left="trash"
          icon-left-hover-weight="bold"
          hide-label
          square
          size="sm"
          variant="outline-secondary"
          :label="$t('projectRowActions.delete')"
          @click="showProjectDeletionModal"
        />
        <button-toggle-pin v-model:active="pinned" hide-label square size="sm" />
      </slot>
    </div>
  </td>
</template>
