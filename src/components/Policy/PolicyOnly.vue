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

const { isServer, isLocal } = useMode()
const { isProjectAdmin } = usePolicies()
const isAdmin = computed(() => isProjectAdmin(props.project.name))
const isVisible = computed(() => (props.admin && isAdmin.value && isServer.value) || isLocal.value)
</script>

<template>
  <slot v-if="isVisible" />
</template>
