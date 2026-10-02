<script setup>
import { computed } from 'vue'
import { useCore } from '@/composables/useCore'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'
import { displayLabelOf, resolveProject } from '@/utils/projects'

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

const core = useCore()

const resolvedProject = computed(() => resolveProject(props.project, core))

const showThumbnail = computed(() => !props.hideThumbnail)

const projectDisplay = computed(() => displayLabelOf(resolvedProject.value))
</script>

<template>
  <span class="project-label">
    <slot name="thumbnail">
      <project-thumbnail
        v-if="showThumbnail"
        :project="resolvedProject"
        :no-caption="noCaption"
        :width="thumbnailWidth"
        :rounded="1"
        class="project-label__thumbnail me-2"
      />
    </slot>
    <span class="project-label__display">
      <slot>{{ projectDisplay }}</slot>
    </span>
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
