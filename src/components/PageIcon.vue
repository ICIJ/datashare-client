<template>
  <div class="page-icon p-1 bg-secondary text-white d-inline-block mr-1 rounded">
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
