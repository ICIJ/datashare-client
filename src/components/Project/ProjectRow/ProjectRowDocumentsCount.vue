<script setup>
import DisplayNumber from '@/components/Display/DisplayNumber'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <td class="project-row-documents-count text-end">
    <slot>
      <display-number :value="project.documentsCount" />
    </slot>
  </td>
</template>
