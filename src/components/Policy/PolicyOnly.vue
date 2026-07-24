<script setup>
import { useMode } from '@/composables/useMode.js'
import { usePolicies } from '@/composables/usePolicies.js'
import { computed } from 'vue'

const props = defineProps({
  admin: {
    type: Boolean,
    default: true
  },
  project: {
    type: Object,
    required: true
  }
})

const { isServer } = useMode()
const { isProjectAdmin } = usePolicies()
const isAdmin = computed(() => isProjectAdmin(props.project.name))
const isVisible = computed(() => !isServer.value || (props.admin && isAdmin.value))
</script>

<template>
  <slot v-if="isVisible" />
</template>
