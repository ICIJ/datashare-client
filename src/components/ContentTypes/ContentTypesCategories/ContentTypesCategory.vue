<template>
  <div class="content-types-category">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.content-types-category {
  > :deep(.content-types-entry) {
    padding-inline-start: $spacer;
  }
}
</style>
