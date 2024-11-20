<script setup>
import { computed } from 'vue'

import ProjectThumbnail from '@/components/Project/ProjectThumbnail'

const props = defineProps({
  projects: {
    type: Array
  }
})

const hasOneProject = computed(() => {
  return props.projects.length === 1
})

const isLastProjectSlice = (p) => {
  return p === props.projects.length - 1
}
</script>

<template>
  <div class="project-dropdown-selector-button-content">
    <span v-for="(project, p) in projects" :key="p" class="project-dropdown-selector-button-content__project">
      <project-thumbnail
        :project="project"
        no-caption
        width="1.2em"
        class="project-dropdown-selector-button-content__project__thumbnail rounded"
      />
      <template v-if="hasOneProject">
        <span class="ms-2">
          {{ project?.label || project?.name }}
        </span>
      </template>
      <template v-else-if="isLastProjectSlice(p)">
        <span class="ms-2">
          {{ $t('searchBarInputDropdownForProjects.projectsCount', projects.length, { count: projects.length }) }}
        </span>
      </template>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.project-dropdown-selector-button-content {
  display: flex;

  &__project {
    display: inline-flex;
    align-items: center;

    &:not(:first-of-type) &__thumbnail {
      box-shadow: -1px 0 0 0 #fff;
      margin-left: -0.5em;
    }

    .project-dropdown-selector--sliced &:last-of-type &__thumbnail {
      background: $text-muted !important;

      &:after {
        content: '+';
        color: #fff;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
