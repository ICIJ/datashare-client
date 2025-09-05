<script setup>
import DisplayDatetimeShort from '@/components/Display/DisplayDatetimeShort'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <td class="project-row-update-date">
    <span
      v-if="project.updateDate"
      class="text-secondary-emphasis"
    >
      <slot>
        <display-datetime-short :value="project.updateDate" />
      </slot>
    </span>
  </td>
</template>
