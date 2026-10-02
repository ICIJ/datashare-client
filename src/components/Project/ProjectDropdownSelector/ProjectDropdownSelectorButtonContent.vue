<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ProjectThumbnailStack from '@/components/Project/ProjectThumbnailStack'

const props = defineProps({
  selectedProjects: {
    type: Array,
    default: () => []
  },
  /**
   * How many project thumbnails to show before the overflow badge.
   */
  sliceSize: {
    type: Number,
    default: 3
  }
})

const { t } = useI18n()

const hasProjects = computed(() => props.selectedProjects.length > 0)
const hasOneProject = computed(() => props.selectedProjects.length === 1)

// A single selection is named outright, while several collapse into a count.
const label = computed(() => {
  const [firstProject] = props.selectedProjects

  if (hasOneProject.value) {
    return firstProject?.label || firstProject?.name
  }

  return t('searchBarInputDropdownForProjects.projectsCount', props.selectedProjects.length)
})
</script>

<template>
  <div class="project-dropdown-selector-button-content">
    <project-thumbnail-stack
      :projects="selectedProjects"
      :max="sliceSize"
      overflow
    />
    <span
      v-if="hasProjects"
      class="project-dropdown-selector-button-content__label ms-2"
    >
      {{ label }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.project-dropdown-selector-button-content {
  display: flex;
  align-items: center;
}
</style>
