<script setup>
import { computed } from 'vue'

import ProjectDetails from '@/components/Project/ProjectDetails'
import { useCore } from '@/composables/core'

const props = defineProps({
  name: {
    type: String
  }
})

const { core } = useCore()

const project = computed(() => {
  return core.findProject(props.name)
})
</script>

<template>
  <div class="project-view-overview-details">
    <project-details :project="project" />
  </div>
</template>

<style lang="scss" scoped>
.project-view-overview-details {
  padding: $spacer-xl;
  margin: $spacer-xl $spacer-lg;
  border-radius: var(--bs-border-radius);
  background: var(--bs-body-bg);
}
</style>
