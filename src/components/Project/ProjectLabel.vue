<script setup>
import { computed } from 'vue'
import { isObject, startCase } from 'lodash'

import { useCore } from '@/composables/core'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'

const props = defineProps({
  /**
   * The project to use to generate the thumbnail. Can contain `name`, `label` and `logoUrl` which
   * will be used to generate the thumbnail consistently. If passed as a string, the project will be
   * retrieved from the config.
   */
  project: {
    type: [Object, String],
    required: true
  },
  /**
   * Hide the project thumbnail.
   */
  hideThumbnail: {
    type: Boolean
  },
  /**
   * Size of the project thumbnail
   */
  thumbnailWidth: {
    type: String,
    default: '1.25em'
  },
  /**
   * Remove the project caption on thumbnail.
   */
  noCaption: {
    type: Boolean
  }
})

const { core } = useCore()

const resolvedProject = computed(() => {
  if (isObject(props.project)) {
    return core?.findProject(props.project.name) ?? props.project
  }
  return core?.findProject(props.project) ?? { name: props.project }
})

const showThumbnail = computed(() => !props.hideThumbnail)

const projectDisplay = computed(() => resolvedProject.value.label ?? startCase(resolvedProject.value.name))
</script>

<template>
  <span class="project-label">
    <project-thumbnail
      v-if="showThumbnail"
      :project="resolvedProject"
      :no-caption="noCaption"
      :width="thumbnailWidth"
      :rounded="1"
      class="project-label__thumbnail me-2"
    />
    <span class="project-label__display">{{ projectDisplay }}</span>
  </span>
</template>

<style lang="scss" scoped>
.project-label {
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  vertical-align: top;
}
</style>
