<template>
  <span class="project-label d-inline-flex align-items-center text-nowrap">
    <project-thumbnail
      v-if="showThumbnail"
      :project="resolvedProject"
      class="project-link__thumbnail me-2 rounded"
      width="1.6em"
    />
    <span class="project-link__display">{{ projectDisplay }}</span>
  </span>
</template>

<script>
import { startCase } from 'lodash'

import ProjectThumbnail from '@/components/ProjectThumbnail'

/**
 * Generate a project's label
 */
export default {
  name: 'ProjectLabel',
  components: { ProjectThumbnail },
  props: {
    /**
     * The project to use to generate the thumbnail. Can contain `name`, `label` and `logoUrl` which
     * will be used to generate the thumbnail consistently. If passed as a string, the project will be
     * retreived from the config.
     */
    project: {
      type: [Object, String],
      required: true
    },
    /**
     * Disable the link (make it not clickable)
     */
    disabled: {
      type: Boolean
    },
    /**
     * Hide the project thumbail.
     */
    hideThumbnail: {
      type: Boolean
    }
  },
  computed: {
    projectDisplay() {
      return this.resolvedProject.label || startCase(this.resolvedProject.name)
    },
    unknownProject() {
      return { name: 'unknown', label: 'Unknown' }
    },
    resolvedProject() {
      return this.$core?.findProject(this.project.name ?? this.project) ?? this.unknownProject
    },
    showThumbnail() {
      return !this.hideThumbnail
    }
  }
}
</script>
