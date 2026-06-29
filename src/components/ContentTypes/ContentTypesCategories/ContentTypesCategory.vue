<template>
  <div class="content-types-category">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.content-types-category {
  // Entries are wrapped in a <b-collapse>, so they are no longer direct
  // children — match them at any depth. Indent past the caret gutter
  // ($spacer-lg, mirrored in ContentTypesCategoryName) by one more level
  // ($spacer) so each entry sits nested one step inside the category checkbox.
  :deep(.content-types-entry) {
    padding-inline-start: $spacer-lg + $spacer;
  }
}
</style>
