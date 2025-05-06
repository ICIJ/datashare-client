<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ProjectThumbnail from '@/components/Project/ProjectThumbnail'

const props = defineProps({
  projects: {
    type: Array
  },
  selectedProjects: {
    type: Array
  },
  sliceSize: {
    type: Number,
    default: 3
  }
})

const { t } = useI18n()

const slicedProjects = computed(() => {
  return props.selectedProjects.slice(0, props.sliceSize + 1)
})

const hasOneProject = computed(() => {
  return props.selectedProjects.length === 1
})

const classList = computed(() => {
  return {
    'project-dropdown-selector-button-content--sliced': props.selectedProjects.length > props.sliceSize
  }
})

const isLastProjectSlice = (p) => {
  return p === slicedProjects.value.length - 1
}
</script>

<template>
  <div class="project-dropdown-selector-button-content" :class="classList">
    <span v-for="(project, p) in slicedProjects" :key="p" class="project-dropdown-selector-button-content__project">
      <project-thumbnail
        :project="project"
        no-caption
        width="1.2em"
        class="project-dropdown-selector-button-content__project__thumbnail rounded"
      />
      <span class="ms-2">
        <template v-if="hasOneProject">
          {{ project?.label || project?.name }}
        </template>
        <template v-else-if="isLastProjectSlice(p)">
          {{ t('searchBarInputDropdownForProjects.projectsCount', selectedProjects.length) }}
        </template>
      </span>
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
      margin-left: -1em;
    }

    .project-dropdown-selector-button-content--sliced &:last-of-type &__thumbnail {
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
