<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AppPopover from '@/components/AppPopover/AppPopover'
import ProjectButton from '@/components/Project/ProjectButton'
import ProjectThumbnailStack from '@/components/Project/ProjectThumbnailStack'
import { toProjectList } from '@/utils/projects'

defineOptions({ name: 'ProjectsButton' })

const props = defineProps({
  /**
   * The projects to display. A bare string is treated as a single project.
   */
  projects: {
    type: [Array, String],
    default: () => []
  }
})

const { t } = useI18n()

const projectList = computed(() => toProjectList(props.projects))

const label = computed(() => {
  return t('searchBarInputDropdownForProjects.projectsCount', projectList.value.length)
})
</script>

<template>
  <project-button
    v-if="projectList.length === 1"
    :project="projectList[0]"
  />
  <app-popover
    v-else-if="projectList.length > 1"
    :title="label"
    hide-close
    class="projects-button__popover"
  >
    <template #target="{ visible }">
      <b-button
        class="project-button projects-button"
        variant="outline-secondary"
        :aria-expanded="visible"
      >
        <project-thumbnail-stack :projects="projectList" />
        <span class="projects-button__label ms-2">{{ label }}</span>
      </b-button>
    </template>
    <div class="projects-button__list d-flex flex-wrap gap-2">
      <project-button
        v-for="(project, index) in projectList"
        :key="index"
        :project="project"
      />
    </div>
  </app-popover>
</template>

<style lang="scss">
// The anchor also carries `.project-button`, which supplies the shared button
// colours and layout. Only what differs from it belongs here.
.projects-button {
  align-items: center;

  // Three columns of project buttons on a wide viewport. The vw ceiling is what makes
  // the list collapse to a single column on narrow screens, per the responsive frame.
  &__popover {
    --bs-popover-max-width: min(33rem, 90vw);
  }

  &__list {
    max-height: 20rem;
    overflow-y: auto;
  }
}
</style>
