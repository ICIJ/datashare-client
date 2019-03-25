<template>
  <div class="document-thumbnail" :class="{ 'document-thumbnail--loaded': loaded, 'document-thumbnail--erroed': erroed }">
    <img :src="thumbnailUrl" :alt="thumbnailAlt" class="document-thumbnail__image"/>
  </div>
</template>

<script>
export default {
  name: 'DocumentThumbnail',
  props: {
    document: {
      type: Object
    },
    page: {
      type: Number,
      default: 0
    },
    size: {
      type: [Number, String],
      default: 'sm'
    }
  },
  data () {
    return {
      loaded: false,
      erroed: false
    }
  },
  computed: {
    thumbnailUrl () {
      return `${process.env.VUE_APP_DS_PREVIEW_HOST}/api/v1/thumbnail?file_path=${this.filePath}&page=${this.page}&size=${this.size}`
    },
    thumbnailAlt () {
      return `${this.document.basename} preview`
    },
    filePath () {
      return escape(this.document.path)
    },
    $img () {
      return this.$el.querySelector('.document-thumbnail__image')
    }
  },
  mounted () {
    this.$img.addEventListener('load', () => this.$set(this, 'loaded', true))
    this.$img.addEventListener('error', () => this.$set(this, 'erroed', true))
  }
}
</script>

<style lang="scss">
  .document-thumbnail {
    width: 80px;
    height: 80px;
    min-width: 80px;
    position: relative;
    border: 1px solid $border-color;
    border-radius: $gray-200;
    overflow: hidden;
    font-size: 0.5rem;
    color: $text-muted;
    background: $body-bg;

    &--loaded:not(&--erroed) &__image {
      opacity: 1;
    }

    &__image {
      transition: opacity 300ms;
      opacity: 0;
      position: absolute;
      min-height: 100%;
      min-width: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>
