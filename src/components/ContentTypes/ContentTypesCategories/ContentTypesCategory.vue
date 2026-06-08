<template>
  <div class="content-types-category">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.content-types-category {
  // Entries are wrapped in a <b-collapse>, so they are no longer direct
  // children — match them at any depth. Indent by the caret gutter width
  // ($spacer-lg, mirrored in ContentTypesCategoryName) so each entry checkbox
  // lines up directly under the category checkbox, one level inside.
  :deep(.content-types-entry) {
    padding-inline-start: $spacer-lg;
  }
}
</style>
