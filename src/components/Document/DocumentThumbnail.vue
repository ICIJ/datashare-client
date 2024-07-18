<template>
  <div v-b-tooltip.right class="document-thumbnail" :class="thumbnailClass" :style="thumbnailStyle" :title="title">
    <img v-if="isActivated" :alt="thumbnailAlt" class="document-thumbnail__image" :src="thumbnailSrc" />
    <span v-if="!loaded && document.contentTypeIcon" class="document-thumbnail__placeholder">
      <phosphor-icon :name="document.contentTypeIcon" :size="size" :scale="1.5" />
    </span>
    <span class="document-thumbnail__overlay">
      <phosphor-icon :name="overlayIcon" :size="size" :scale="1.5" />
    </span>
  </div>
</template>

<script>
import { PhosphorIcon } from '@icij/murmur-next'

import preview from '@/mixins/preview'

/**
 * The document's thumbnail (using the preview) server
 */
export default {
  name: 'DocumentThumbnail',
  components: {
    PhosphorIcon
  },
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
     * @values xs, sm, md, lg, xl, xxl
     */
    size: {
      type: [Number, String],
      default: 'sm'
    },
    /**
     * The image is clickable and can have a hover effect
     */
    clickable: {
      type: Boolean
    },
    /**
     * The image has an active effect
     */
    active: {
      type: Boolean
    },
    /**
     * The image has a hover effect
     */
    hover: {
      type: Boolean
    },
    /**
     * Crop the image to have fixed squared size
     */
    crop: {
      type: Boolean
    },
    /**
     * Fit the image to its container
     */
    fit: {
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
    },
    /**
     * Make sure the placeholder is never visible
     */
    hidePlaceholder: {
      type: Boolean
    }
  },
  data() {
    return {
      loaded: false,
      errored: false,
      thumbnailSrc: null,
      observer: null
    }
  },
  computed: {
    thumbnailClass() {
      return {
        'document-thumbnail--hide-placeholder': this.hidePlaceholder,
        'document-thumbnail--active': this.active,
        'document-thumbnail--crop': this.crop,
        'document-thumbnail--fit': this.fit,
        'document-thumbnail--errored': this.errored,
        'document-thumbnail--loaded': this.loaded,
        'document-thumbnail--clickable': this.clickable,
        'document-thumbnail--hover': this.hover,
        'document-thumbnail--estimated-size': this.ratio !== null,
        [`document-thumbnail--${this.size}`]: isNaN(this.size)
      }
    },
    thumbnailStyle() {
      return {
        '--estimated-ratio': this.ratio,
        '--estimated-height': isNaN(this.size) ? null : `${this.size}px`
      }
    },
    thumbnailUrl() {
      const { index, id, routing } = this.document
      const { page, size } = this
      return this.getPreviewUrl({ index, id, routing }, { page, size })
    },
    thumbnailAlt() {
      return `${this.document.basename} preview`
    },
    isActivated() {
      return !!this.$config.get('previewHost') || this.canPreviewRaw(this.document)
    },
    lazyLoadable() {
      return window && 'IntersectionObserver' in window
    },
    overlayIcon() {
      return this.errored ? 'eye-slash' : 'eye'
    },
    title() {
      return this.errored ? this.$t('documentThumbnail.noPreview') : ''
    }
  },
  async mounted() {
    // This component can be deactivated globally
    if (!this.isActivated) return
    // This component can be lazy loaded
    if (this.lazy && this.lazyLoadable) return this.bindObserver()
    // Fetch directly
    await this.fetchAndLoad()
  },
  methods: {
    async fetchAsBase64() {
      if (this.canPreviewRaw(this.document)) {
        return this.fetchImageAsBase64(this.document.inlineFullUrl)
      }
      return this.fetchImageAsBase64(this.thumbnailUrl)
    },
    async fetchAndLoad() {
      try {
        if (!this.loaded && !this.errored) {
          this.thumbnailSrc = await this.fetchAsBase64()
          this.loaded = true
          /**
           * The thumbnail is loaded
           *
           * @event enter
           */
          this.$emit('loaded')
        }
      } catch (_) {
        this.errored = true
        /**
         * The thumbnail could not be loaded
         *
         * @event enter
         */
        this.$emit('errored')
      }
    },
    bindObserver() {
      this.observer = new IntersectionObserver(async (entries) => {
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
  }
}
</script>

<style lang="scss" scoped>
.document-thumbnail {
  $zindex-image: 0;
  $zindex-placeholder: 0;
  $zindex-border: 20;
  $zindex-overlay: 30;

  $heights: (
    xs: 50px,
    sm: 80px,
    md: 150px,
    lg: 310px,
    xl: 720px,
    xxl: 960px
  );

  @each $name, $value in $heights {
    &--#{$name} {
      --height: #{$value};
    }
  }

  background: var(--bs-body-bg);
  color: var(--bs-tertiary-color);
  min-width: var(--height);
  max-width: var(--height);
  overflow: hidden;
  position: relative;

  &:after {
    content: '';
    display: block;
    position: absolute;
    width: 1px;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: $zindex-border;
    background: transparent;
  }

  &--active:after,
  &--clickable:hover:after,
  &--hover:after {
    background: $secondary;
  }

  &--clickable:hover,
  &--hover {
    .document-thumbnail__placeholder {
      display: none;
    }

    .document-thumbnail__overlay {
      display: flex;
      cursor: pointer;
    }

    .document-thumbnail__placeholder + .document-thumbnail__overlay {
      cursor: auto;
    }
  }

  &--fit {
    max-width: 100%;
  }

  &--crop {
    height: var(--height);
    width: var(--height);
  }

  &--loaded:not(&--errored) &__image {
    opacity: 1;
  }

  &--estimated-size:not(&--loaded):not(&--errored) {
    &:before {
      content: '';
      display: inline-block;
      max-width: calc(var(--estimated-height) / var(--estimated-ratio));
      padding-top: calc(100% * var(--estimated-ratio));
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
    position: relative;
    z-index: $zindex-image;
    margin: auto;
    opacity: 0;
    transition: opacity 300ms;
    max-height: 100%;
    max-width: 100%;
  }

  &--crop &__image {
    left: 50%;
    min-height: 100%;
    min-width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    height: 100%;
    object-fit: center top;
  }

  &__placeholder {
    position: absolute;
    z-index: $zindex-placeholder;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bs-light-bg-subtle);
  }

  &--hide-placeholder &__placeholder {
    display: none;
  }

  &__overlay {
    position: absolute;
    z-index: $zindex-overlay;
    left: 1px;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--bs-lighter-rgb), 0.5);
    color: var(--bs-tertiary);
    display: none;
  }

  &__placeholder + &__overlay {
    background: var(--bs-light-bg-subtle);
  }
}
</style>
