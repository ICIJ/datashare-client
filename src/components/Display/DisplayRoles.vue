<script setup>
import { computed } from 'vue'

import DisplayRole from '@/components/Display/DisplayRole.vue'
import {usePolicies} from "@/composables/usePolicies.js";
const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  noIcon: {
    type: Boolean,
    default: false
  }
})

const { getRolesByProject } = usePolicies()
const roles = computed(() => getRolesByProject(props.project.name))
</script>

<template>
  <span
    v-if="roles"
    class="text-secondary-emphasis d-inline-flex align-items-center gap-1"
  ><phosphor-icon
    v-if="!noIcon"
    :name="PhUserSquare"
  />
    <template
      v-for="(role,index) in roles"
      :key="index"
    >
      <display-role
        :value="role"
        no-icon
      /><span v-if="index !== roles.length-1">, </span>
    </template>
  </span>
</template>
