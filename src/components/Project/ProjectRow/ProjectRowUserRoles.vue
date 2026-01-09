<script setup>
import DisplayRoles from '@/components/Display/DisplayRoles.vue'

defineProps({
  project: {
    type: Object,
    required: true,
  }
})
</script>

<template>
  <td class="project-row-user-roles">
    <slot>
      <display-roles
        :project="project"
        no-icon
      />
    </slot>
  </td>
</template>
