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
    <hook
      name="document-view-title:before"
      :bind="{ document }"
    />
    <h2 class="document-view-title__title d-flex flex-grow-1 justify-content-between align-items-center m-0">
      <document-title
        interactive-root
        :document="document"
      />
      <project-button
        :project="document.project"
        class="flex-shrink-0"
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
