<template>
  <span class="project-label">
    <project-thumbnail
      v-if="showThumbnail"
      :project="resolvedProject"
      class="project-label__thumbnail me-2 rounded"
      width="1.25em"
    />
    <span class="project-label__display">{{ projectDisplay }}</span>
  </span>
</template>

<script>
import { isObject, startCase } from 'lodash'

import ProjectThumbnail from '@/components/Project/ProjectThumbnail'

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
     * Hide the project thumbail.
     */
    hideThumbnail: {
      type: Boolean
    }
  },
  computed: {
    projectDisplay() {
      return this.resolvedProject.label ?? startCase(this.resolvedProject.name)
    },
    resolvedProject() {
      if (isObject(this.project)) {
        return this.$core?.findProject(this.project.name) ?? this.project
      }
      return this.$core?.findProject(this.project) ?? { name: this.project }
    },
    showThumbnail() {
      return !this.hideThumbnail
    }
  }
}
</script>

<style lang="scss" scoped>
.project-label {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  vertical-align: top;
}
</style>
