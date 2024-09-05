<script setup>
import { computed } from 'vue'

import PageHeader from '@/components/PageHeader/PageHeader'
import ProjectEntries from '@/components/Project/ProjectEntries/ProjectEntries'
import { useCore } from '@/composables/core'

const { core } = useCore()
const projects = computed(() => core.projects)
</script>

<template>
  <div class="project-list">
    <page-header no-toggle-settings :to-add="{ name: 'project.new' }" />
    <project-entries :projects="projects" layout="table" />
  </div>
</template>
