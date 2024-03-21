<template>
  <div class="page-icon bg-secondary text-white me-1 rounded">
    <fa :icon="icon" fixed-width :size="size"></fa>
  </div>
</template>

<script>
/**
 * A squared icon to display on every page title
 */
export default {
  name: 'PageIcon',
  props: {
    /**
     * A FortAwesome definition object
     */
    icon: {
      type: [String, Array, Object]
    },
    /**
     * A FortAwesome size string
     */
    size: {
      type: String,
      default: '2x'
    }
  }
}
</script>

<style scoped lang="scss">
.page-icon {
  width: 4rem;
  height: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
