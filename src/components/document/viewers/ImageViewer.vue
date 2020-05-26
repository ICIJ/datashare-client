<template>
  <div class="image-viewer m-auto p-3">
    <img :src="href" class="d-inline-block" />
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
  },
  computed: {
    href () {
      const url = new URL(this.document.fullUrl)
      url.searchParams.set('inline', true)
      return url.href
    }
  }
}
</script>

<style>
  .image-viewer img {
    max-width: 100%;
  }
</style>
