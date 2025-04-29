<template>
  <div class="task-board-list container-fluid bg-tertiary-subtle p-3 py-md-4 px-md-5">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.task-board-list {
  display: grid;
  gap: $spacer-xxl;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));

  @media (min-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include media-breakpoint-down(md) {
    display: block;
  }
}
</style>
