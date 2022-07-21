<script>
export default {
  name: 'DocumentContentSlice',
  props: {
    slice: {
      type: Object,
      required: true
    }
  },
  computed: {
    cookedContent () {
      return this.slice.get().cookedContent
    }
  }
}
</script>

<template>
  <div class="document-content-slice" v-html="cookedContent"></div>
</template>
