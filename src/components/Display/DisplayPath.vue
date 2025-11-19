<script setup>
import { computed } from 'vue'

import { useDataDir } from '@/composables/useDataDir'

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

const { getMountedPath } = useDataDir()

const displayPath = computed(() => getMountedPath(props.value))
</script>

<template>
  <span class="display-path">{{ displayPath }}</span>
</template>
