<template>
  <div class="content-types-category">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.content-types-category {
  // Entries are wrapped in a <b-collapse>, so they are no longer direct
  // children — match them at any depth to keep the one-level indent inside the
  // category while the caret/header row stays flush.
  :deep(.content-types-entry) {
    padding-inline-start: $spacer;
  }
}
</style>
