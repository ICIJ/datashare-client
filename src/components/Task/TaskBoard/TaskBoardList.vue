<template>
  <div class="task-board-list container-fluid bg-tertiary-subtle py-4">
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
}
</style>
