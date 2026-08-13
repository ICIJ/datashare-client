<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'

import AppPopover from '@/components/AppPopover/AppPopover'
import ProjectButton from '@/components/Project/ProjectButton'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'
import { useCore } from '@/composables/useCore'

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

const THUMBNAILS_COUNT = 2

const { t } = useI18n()
const core = useCore()

const projectList = computed(() => {
  return isString(props.projects) ? [props.projects] : props.projects
})

const hasSingleProject = computed(() => projectList.value.length === 1)
const hasPopover = computed(() => projectList.value.length > 1)
const thumbnails = computed(() => projectList.value.slice(0, THUMBNAILS_COUNT))
const label = computed(() => t('projectsButton.projectsCount', projectList.value.length))

const resolveProject = (project) => {
  if (isObject(project)) {
    return core?.findProject(project.name) ?? project
  }
  return core?.findProject(project) ?? { name: project }
}
</script>

<template>
  <project-button
    v-if="hasSingleProject"
    :project="projectList[0]"
  />
  <app-popover
    v-else-if="hasPopover"
    :title="label"
    class="projects-button__popover"
  >
    <template #target="{ visible }">
      <b-button
        class="projects-button"
        variant="outline-secondary"
        :aria-expanded="visible"
      >
        <span class="projects-button__thumbnails">
          <project-thumbnail
            v-for="(project, index) in thumbnails"
            :key="index"
            :project="resolveProject(project)"
            :rounded="1"
            no-caption
            width="1.25em"
            class="projects-button__thumbnails__item"
          />
        </span>
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
.projects-button {
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-border-color: var(--bs-light);
  --bs-btn-bg: var(--bs-body-bg);
  --bs-btn-hover-bg: var(--bs-btn-bg);
  --bs-btn-hover-color: var(--bs-btn-color);
  --bs-btn-hover-border-color: var(--bs-primary);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex-wrap: nowrap;

  &__thumbnails {
    display: inline-flex;
    align-items: center;

    // Overlap the thumbnails, matching ProjectDropdownSelectorButtonContent.
    &__item:not(:first-of-type) {
      box-shadow: -1px 0 0 0 var(--bs-body-bg);
      margin-left: -0.5em;
    }
  }

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
