<script setup>
import DisplayRole from '@/components/Display/DisplayRole'

defineProps({
  roles: {
    type: Array,
    required: true,
  }
})
</script>

<template>
  <td class="project-row-user-roles">
    <span
      v-if="roles"
      class="text-secondary-emphasis"
    >
      <slot>
        <template
          v-for="(role,index) in roles"
          :key="role"
        >
          <display-role
            :value="role"
            no-icon
          /><span v-if="index !== roles.length-1">, </span></template>
      </slot>
    </span>
  </td>
</template>
