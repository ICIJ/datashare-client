<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
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
  <div
    v-if="project.documentsCount"
    v-b-tooltip.body
    class="project-card-documents-count text-secondary-emphasis d-inline-flex gap-1 align-items-center flex-wrap"
    :title="$n(project.documentsCount)"
  >
    <slot>
      <phosphor-icon name="files" class="me-1" />
      {{ $tc('projectCardDocumentsCount.label', project.documentsCount, { humanDocumentsCount }) }}
    </slot>
  </div>
</template>
