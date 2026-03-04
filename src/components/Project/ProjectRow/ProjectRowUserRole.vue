<script setup>
import DisplayRole from "@/components/Display/DisplayRole.vue";

defineProps({
  project: {
    type: Object,
    required: true,
  }
})
</script>

<template>
  <td class="project-row-user-role">
    <slot>
      <display-role
        value="PROJECT_MEMBER"
        :project="project"
        no-icon
      />
    </slot>
  </td>
</template>
