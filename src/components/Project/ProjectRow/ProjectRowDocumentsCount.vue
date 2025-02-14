<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import humanNumber from '@/utils/humanNumber'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const { tm } = useI18n()

const humanDocumentsCount = computed(() => {
  return humanNumber(props.project.documentsCount, tm('human.number'))
})
</script>

<template>
  <td class="project-row-documents-count text-end">
    <span
      v-if="project.documentsCount"
      v-b-tooltip.body
      class="text-secondary-emphasis"
      :title="$n(project.documentsCount)"
    >
      <slot>
        {{ humanDocumentsCount }}
      </slot>
    </span>
  </td>
</template>
