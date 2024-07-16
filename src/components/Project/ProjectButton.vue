<script setup>
import ProjectLabel from './ProjectLabel'

defineProps({
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
})
</script>

<template>
  <b-button class="project-button" variant="outline-light">
    <project-label :project="project" :hide-thumbnail="hideThumbnail">
      <slot />
    </project-label>
  </b-button>
</template>

<style lang="scss" scoped>
.project-button {
  display: inline-flex;
  border-color: transparent;
  box-shadow: 0px 0px 2px 0 #b1aeae;
}
</style>
