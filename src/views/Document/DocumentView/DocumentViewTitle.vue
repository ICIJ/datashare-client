<script setup>
import DocumentTitle from '@/components/Document/DocumentTitle/DocumentTitle'
import Hook from '@/components/Hook/Hook'
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
    <hook name="document-view-title:before" :bind="{ document }" />
    <h2 class="document-view-title__title m-0 flex-grow-1">
      <document-title interactive-root :document="document" />
    </h2>
    <project-button :project="document.project" class="flex-shrink-0" />
    <hook name="document-view-title:after" :bind="{ document }" />
  </div>
</template>

<style lang="scss" scoped>
.document-view-title {
  &__title {
    font-size: 1.25rem;
  }
}
</style>
