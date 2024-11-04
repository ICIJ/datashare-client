<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ProjectButton from '@/components/Project/ProjectButton'

const props = defineProps({
  occurrences: {
    type: Number,
    default: 0
  },
  projects: {
    type: Array,
    default: () => []
  }
})

const { t, n } = useI18n()

const occurrences = computed(() => {
  return t('entityPopoverMentionOccurrences.occurrences', {
    n: props.occurrences,
    occurrences: n(props.occurrences)
  })
})

const nbProjects = computed(() => props.projects?.length ?? 0)
const projectList = computed(() => t('entityPopoverMentionOccurrences.projects', { n: nbProjects }))
const anyOccurences = computed(() => props.occurrences > 0 && nbProjects.value)
</script>

<template>
  <div v-if="anyOccurences" class="entity-popover-mention-occurrences">
    <p>{{ `${occurrences} ${projectList}` }}</p>
    <div class="d-flex flex-wrap gap-2">
      <project-button v-for="(project, index) in projects" :key="index" :project="project" />
    </div>
  </div>
</template>
