<template>
  <div class="page-icon p-1 bg-secondary text-white d-inline-block mr-1 rounded">
    <fa :icon="icon" fixed-width />
  </div>
</template>

<script>
/**
 * A squared icon to display on every page title
 */
export default {
  name: 'PageIcon',
  props: {
    icon: {
      /**
       * A FortAwesome definition object
       */
      type: [String, Array, Object]
    }
  }
}
</script>
