<template>
  <div class="document-thumbnail" :class="thumbnailClass" :style="thumbnailStyle">
    <img v-if="isActivated"
        :alt="thumbnailAlt"
        :src="thumbnailSrc"
        class="document-thumbnail__image" />
    <span class="document-thumbnail__placeholder" v-if="!loaded">
      <fa :icon="document.contentTypeIcon" />
    </span>
  </div>
</template>

<script>
import preview from '../mixins/preview'

/**
 * The document's thumbnail (using the preview) server
 */
export default {
  name: 'DocumentThumbnail',
  mixins: [preview],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    },
    /**
     * The page to display
     */
    page: {
      type: Number,
      default: 0
    },
    /**
     * Size of the thumbnail
     * @values xs, sm, md, lg, xl
     */
    size: {
      type: [Number, String],
      default: 'sm'
    },
    /**
     * Crop the image to have fixed squared size
     */
    crop: {
      type: Boolean
    },
    /**
     * Load the thumbnail only when it enters the viewport
     */
    lazy: {
      type: Boolean
    },
    /**
     * Optional ratio information to estimate thumbnail width
     */
    ratio: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      loaded: false,
      errored: false,
      thumbnailSrc: null,
      observer: null
    }
  },
  computed: {
    thumbnailClass () {
      return {
        'document-thumbnail--crop': this.crop,
        'document-thumbnail--errored': this.errored,
        'document-thumbnail--loaded': this.loaded,
        'document-thumbnail--estimated-size': this.ratio !== null,
        [`document-thumbnail--${this.size}`]: isNaN(this.size)
      }
    },
    thumbnailStyle () {
      return {
        '--estimated-ratio': this.ratio,
        '--estimated-height': isNaN(this.size) ? null : `${this.size}px`
      }
    },
    thumbnailUrl () {
      const { index, id, routing } = this.document
      const { page, size } = this
      return this.getPreviewUrl({ index, id, routing }, { page, size })
    },
    thumbnailAlt () {
      return `${this.document.basename} preview`
    },
    isActivated () {
      return !!this.$config.get('previewHost')
    },
    lazyLoadable () {
      return window && 'IntersectionObserver' in window
    }
  },
  methods: {
    async fetchAsBase64 () {
      return this.fetchPreviewAsBase64(this.thumbnailUrl)
    },
    async fetchAndLoad () {
      try {
        if (!this.loaded && !this.errored) {
          this.$set(this, 'thumbnailSrc', await this.fetchAsBase64())
          this.$set(this, 'loaded', true)
        }
      } catch (_) {
        this.$set(this, 'errored', true)
      }
    },
    bindObserver () {
      this.observer = new IntersectionObserver(async entries => {
        if (entries[0].isIntersecting) {
          /**
           * The thumbnail enters the viewport.
           *
           * @event enter
           */
          this.$emit('enter', entries[0])
          // Fetch the thumbnail
          await this.fetchAndLoad()
        }
      })
      // Observe the component element
      this.observer.observe(this.$el)
    }
  },
  async mounted () {
    // This component can be deactivated globally
    if (!this.isActivated) return
    // This component can be lazy loaded
    if (this.lazy && this.lazyLoadable) return this.bindObserver()
    // Fetch directly
    await this.fetchAndLoad()
  }
}
</script>

<style lang="scss">
  .document-thumbnail {
    $heights: (xs: 80px, sm: 310px, md: 540px, lg: 720px, xl: 960px);

    @each $name, $value in $heights {
      --height-#{$name}: #{$value};
    }

    min-width: 80px;
    max-width: 100%;
    position: relative;
    overflow: hidden;
    background: $body-bg;
    color: mix($body-bg, $text-muted, 70%);

    &--crop {
      width: 80px;
      height: 80px;
    }

    &--loaded:not(&--errored) &__image {
      opacity: 1;
    }

    &--estimated-size:not(&--loaded):not(&--errored) {

      &:before {
        content: "";
        display: inline-block;
        padding-top: calc(100% * var(--estimated-ratio));
        max-width: calc(var(--estimated-height) / var(--estimated-ratio));
        width: 100%;
      }

      .document-thumbnail__image {
        position: absolute;
      }
    }

    @each $name, $value in $heights {
      &--estimated-size:not(&--loaded):not(&--errored).document-thumbnail--#{$name} &__image {
        height: $value;
        width: calc(#{$value} / var(--estimated-ratio));
      }
    }

    &__image {
      display: inline-block;
      max-width: 100%;
      margin: auto;
      opacity: 0;
      transition: opacity 300ms;
    }

    &--crop &__image {
      position: absolute;
      min-height: 100%;
      min-width: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &__placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>
