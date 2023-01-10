<template>
  <div class="image-viewer m-auto p-3">
    <img :src="document.inlineFullUrl" class="d-inline-block" />
  </div>
</template>

<script>
/**
 * Display a preview image of the document.
 */
export default {
  name: 'ImageViewer',
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  }
}
</script>

<style>
.image-viewer img {
  max-width: 100%;
}
</style>
