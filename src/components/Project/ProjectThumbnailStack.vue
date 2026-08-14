<script setup>
import { computed } from 'vue'

import ProjectThumbnail from '@/components/Project/ProjectThumbnail'
import { useCore } from '@/composables/useCore'
import { resolveProject, toProjectList } from '@/utils/projects'

defineOptions({ name: 'ProjectThumbnailStack' })

const props = defineProps({
  /**
   * The projects to stack. A bare string is treated as a single project, and
   * entries may be either project names or project objects.
   */
  projects: {
    type: [Array, String],
    default: () => []
  },
  /**
   * How many thumbnails to render. The overflow badge, when enabled, is appended
   * after them rather than taking the place of one.
   */
  max: {
    type: Number,
    default: 2
  },
  /**
   * Append a badge indicating more projects exist beyond `max`.
   */
  overflow: {
    type: Boolean
  }
})

const core = useCore()

const projectList = computed(() => toProjectList(props.projects))

const visibleProjects = computed(() => {
  return projectList.value.slice(0, props.max).map(project => resolveProject(project, core))
})

const hasOverflow = computed(() => {
  return props.overflow && projectList.value.length > props.max
})
</script>

<template>
  <span class="project-thumbnail-stack">
    <project-thumbnail
      v-for="(project, index) in visibleProjects"
      :key="index"
      :project="project"
      width="1.25em"
      :rounded="1"
      no-caption
      class="project-thumbnail-stack__item"
    />
    <span
      v-if="hasOverflow"
      class="project-thumbnail-stack__item project-thumbnail-stack__overflow rounded-1"
    >
      +
    </span>
  </span>
</template>

<style lang="scss" scoped>
$thumbnail-size: 1.25em;

.project-thumbnail-stack {
  display: inline-flex;
  align-items: center;

  &__item:not(:first-child) {
    margin-left: -0.5em;
    box-shadow: -1px 0 0 0 var(--bs-body-bg);
  }

  &__overflow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: $thumbnail-size;
    height: $thumbnail-size;
    color: var(--bs-body-bg);
    background: var(--bs-secondary-color);
  }
}
</style>
