<template>
  <component :is="is" :to="to" class="project-link">
    <project-label :project="project" :hide-thumbnail="hideThumbnail" />
  </component>
</template>

<script>
import ProjectLabel from './ProjectLabel'

/**
 * Generate a link to a project page
 */
export default {
  name: 'ProjectLink',
  components: { ProjectLabel },
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
    is() {
      return this.disabled ? 'span' : 'router-link'
    },
    to() {
      const name = this.project.name ?? this.project
      return { name: 'project.view', params: { name } }
    }
  }
}
</script>

<style lang="scss" scoped>
.project-link {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  vertical-align: top;
}
</style>
