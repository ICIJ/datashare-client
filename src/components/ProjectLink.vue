<template>
  <component :is="is" :to="projectRoute" class="project-link d-inline-flex align-items-center text-nowrap">
    <project-thumbnail
      v-if="showThumbnail"
      :project="resolvedProject"
      class="project-link__thumbnail mr-1 rounded"
      width="1.6em"
    />
    <span class="project-link__display">{{ projectDisplay }}</span>
  </component>
</template>

<script>
import ProjectThumbnail from '@/components/ProjectThumbnail'

/**
 * Generate a link to a project page
 */
export default {
  name: 'ProjectLink',
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
    is() {
      return this.disabled ? 'span' : 'router-link'
    },
    projectDisplay() {
      return this.resolvedProject.label || this.resolvedProject.name
    },
    projectRoute() {
      const { name } = this.resolvedProject
      return { name: 'project.view', params: { name } }
    },
    unknownProject() {
      return { name: 'unknown', label: 'Unknown' }
    },
    resolvedProject() {
      return this.$core.findProject(this.project.name ?? this.project) ?? this.unknownProject
    },
    showThumbnail() {
      return !this.hideThumbnail
    }
  }
}
</script>

<style scoped lang="scss">
.project-link {
  font-weight: bold;
}
</style>
