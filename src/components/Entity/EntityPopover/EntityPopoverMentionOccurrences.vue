<script setup>
import { useI18n } from 'vue-i18n'

import ProjectLink from '@/components/Project/ProjectLink'

const props = defineProps({
  nbMentions: {
    type: Number
  },
  projects: {
    type: Array,
    default: () => []
  }
})
const { t, n } = useI18n()
const nbProjects = props.projects?.length ?? 0
const occurrences = t('entityPopoverMentionOccurrences.occurrences', {
  n: props.nbMentions,
  nbMentions: n(props.nbMentions)
})
const projectList = t('entityPopoverMentionOccurrences.projectList', { n: nbProjects })
</script>

<template>
  <div class="entity-popover-mention-occurrences">
    <p>{{ `${occurrences} ${projectList}` }}</p>
    <div class="d-flex gap-2">
      <project-link v-for="(project, index) in projects" :key="index" :project="project" />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
