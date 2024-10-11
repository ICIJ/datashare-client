<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const toProjectEdit = computed(() => ({
  name: 'project.view.edit',
  params: {
    name: props.project.name
  }
}))

const toProjetDelete = computed(() => ({
  name: 'project.view.delete',
  params: {
    name: props.project.name
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
          :to="toProjetDelete"
          icon-left="trash"
          icon-left-hover-weight="bold"
          hide-label
          square
          size="sm"
          variant="outline-secondary"
          :label="$t('projectRowActions.delete')"
        />
      </slot>
    </div>
  </td>
</template>
