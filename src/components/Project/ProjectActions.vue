<script setup>
import { computed } from 'vue'

import { useProjectDeletionModal } from '@/composables/useProjectDeletionModal'
import { useProjectPinned } from '@/composables/useProjectPinned'
import ButtonIcon from '@/components/Button/ButtonIcon'
import ButtonTogglePin from '@/components/Button/ButtonTogglePin'
import ModeLocalOnly from '@/components/Mode/ModeLocalOnly'

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
  <div class="project-actions d-flex gap-2">
    <slot>
      <mode-local-only>
        <button-icon
          :to="toProjectEdit"
          icon-left="pencil"
          icon-left-hover-weight="bold"
          hide-label
          square
          size="sm"
          variant="outline-secondary"
          class="border-0"
          :label="$t('projectRowActions.edit')"
        />
        <button-icon
          icon-left="trash"
          icon-left-hover-weight="bold"
          hide-label
          square
          size="sm"
          variant="outline-secondary"
          class="border-0"
          :label="$t('projectRowActions.delete')"
          @click="showProjectDeletionModal"
        />
      </mode-local-only>
      <button-toggle-pin v-model:active="pinned" hide-label square size="sm" />
    </slot>
  </div>
</template>
