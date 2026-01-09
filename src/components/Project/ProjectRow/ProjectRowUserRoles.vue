<script setup>
import { computed } from 'vue'
import { usePolicies } from '@/composables/usePolicies.js'
import DisplayRoles from '@/components/Display/DisplayRoles.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  }
})
const { getRolesByProject } = usePolicies()
const roles = computed(() => getRolesByProject(props.project.name))
</script>

<template>
  <td class="project-row-user-roles">
    <span
      v-if="roles"
      class="text-secondary-emphasis"
    >
      <slot>
        <display-roles :roles="roles" />
      </slot>
    </span>
  </td>
</template>
