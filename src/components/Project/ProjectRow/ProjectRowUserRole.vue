<script setup>
import DisplayRole from '@/components/Display/DisplayRole.vue'
import {usePolicies} from '@/composables/usePolicies.js'
import {computed} from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  }
})
const { getRoleByProject } = usePolicies()
const userRole = computed(() => getRoleByProject(props.project.name))
</script>

<template>
  <td class="project-row-user-role">
    <slot>
      <display-role
        :value="userRole"
        :project="project"
        no-icon
      />
    </slot>
  </td>
</template>
