<script setup>
import DocumentSlicedName from '@/components/DocumentSlicedName'
import ProjectButton from '@/components/Project/ProjectButton'

defineProps({
  document: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="document-view-title d-flex align-items-center column-gap-3 row-gap-1">
    <h2 class="document-view-title__title m-0 flex-grow-1">
      <document-sliced-name interactive-root :document="document" />
    </h2>
    <project-button :project="document.project" />
  </div>
</template>

<style lang="scss" scoped>
.document-view-title {
  &__title {
    font-size: 1.25rem;
  }
}
</style>
