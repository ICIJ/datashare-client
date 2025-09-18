<script setup>
import DocumentTitle from '@/components/Document/DocumentTitle/DocumentTitle'
import Hook from '@/components/Hook/Hook'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail'
import { computed } from 'vue'
import { isObject, startCase } from 'lodash'
import { useCore } from '@/composables/useCore'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { core } = useCore()

const resolvedProject = computed(() => {
  if (isObject(props.document.project)) {
    return core?.findProject(props.document.project.name) ?? props.document.project
  }
  return core?.findProject(props.document.project) ?? { name: props.document.project }
})
const projectDisplay = computed(() => resolvedProject.value.label ?? startCase(resolvedProject.value.name))

</script>

<template>
  <div class="document-view-title d-flex align-items-center column-gap-3 row-gap-1">
    <hook
      name="document-view-title:before"
      :bind="{ document }"
    />
    <h2 class="document-view-title__title flex-grow-1 d-flex gap-2 align-items-center m-0">
      <project-thumbnail
        :project="projectDisplay"
        width="1.5em"
      />
      <document-title
        interactive-root
        :document="document"
      />
    </h2>
    <hook
      name="document-view-title:after"
      :bind="{ document }"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-view-title {
  &__title {
    font-size: 1.25rem;
  }
}
</style>
