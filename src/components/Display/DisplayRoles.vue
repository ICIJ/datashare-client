<script setup>
import DisplayRole from '@/components/Display/DisplayRole.vue'
defineProps({
  roles: {
    type: Array,
    required: true
  }
})

</script>
<template>
  <div
    v-for="(role,index) in roles"
    :key="index"
  >
    <display-role
      :value="role"
      no-icon
    /><span v-if="index !== roles.length-1">, </span>
  </div>
</template>
