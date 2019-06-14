<template>
  <div v-if="isActivated" class="document-thumbnail" :class="{ 'document-thumbnail--loaded': loaded, 'document-thumbnail--erroed': erroed, 'document-thumbnail--crop': crop }">
    <component :is="component" :src="thumbnailUrl" :alt="thumbnailAlt" class="document-thumbnail__image"/>
  </div>
</template>

<script>
import VLazyImage from 'v-lazy-image'

export default {
  name: 'DocumentThumbnail',
  components: {
    VLazyImage
  },
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
    },
    crop: {
      type: Boolean
    },
    lazy: {
      type: Boolean
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
      return `${process.env.VUE_APP_DS_PREVIEW_HOST}/api/v1/thumbnail/${this.document.index}/${this.document.id}?routing=${this.document.routing}&page=${this.page}&size=${this.size}`
    },
    thumbnailAlt () {
      return `${this.document.basename} preview`
    },
    filePath () {
      return escape(this.document.path)
    },
    isActivated () {
      return this.$config.get('document-thumbnail.activated')
    },
    component () {
      return this.lazy ? 'v-lazy-image' : 'img'
    }
  },
  mounted () {
    if (this.isActivated) {
      const $img = this.$el.querySelector('.document-thumbnail__image')
      $img.addEventListener('load', () => {
        this.$nextTick(() => this.$set(this, 'loaded', true))
      })
      $img.addEventListener('error', () => {
        this.$nextTick(() => this.$set(this, 'erroed', true))
      })
    }
  }
}
</script>

<style lang="scss">
  .document-thumbnail {
    min-width: 80px;
    min-height: 2rem;
    position: relative;
    border: 1px solid $border-color;
    border-radius: $gray-200;
    overflow: hidden;
    font-size: 0.5rem;
    color: $text-muted;
    background: $body-bg;

    &--crop {
      width: 80px;
      height: 80px;
    }

    &--loaded:not(&--erroed) &__image, .v-lazy-image-loaded {
      opacity: 1;
    }

    &__image {
      transition: opacity 300ms;
      opacity: 0;
    }

    &--crop &__image {
      position: absolute;
      min-height: 100%;
      min-width: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>
