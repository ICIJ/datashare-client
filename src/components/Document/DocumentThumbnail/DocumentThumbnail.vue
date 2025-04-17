<template>
  <div
    v-b-tooltip.body.right="{ delay: tooltipDelay }"
    class="document-thumbnail"
    :class="classList"
    :style="style"
    :title="title"
  >
    <document-thumbnail-image
      v-if="showImage"
      class="document-thumbnail__image"
      :alt="thumbnailAlt"
      :src="thumbnailSrc"
      :crop="crop"
      :fit="fit"
    />
    <document-thumbnail-placeholder
      v-if="showPlaceholder"
      class="document-thumbnail__placeholder"
      :document="document"
      :size="String(size)"
    />
    <document-thumbnail-overlay
      v-if="showOverlay"
      class="document-thumbnail__overlay"
      :icon="overlayIcon"
      :size="String(size)"
    />
  </div>
</template>

<script>
import preview from '@/mixins/preview'
import DocumentThumbnailImage from '@/components/Document/DocumentThumbnail/DocumentThumbnailImage'
import DocumentThumbnailPlaceholder from '@/components/Document/DocumentThumbnail/DocumentThumbnailPlaceholder'
import DocumentThumbnailOverlay from '@/components/Document/DocumentThumbnail/DocumentThumbnailOverlay'

/**
 * The document's thumbnail (using the preview) server
 */
export default {
  name: 'DocumentThumbnail',
  components: {
    DocumentThumbnailImage,
    DocumentThumbnailPlaceholder,
    DocumentThumbnailOverlay
  },
  mixins: [preview],
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
    clickable: {
      type: Boolean
    },
    active: {
      type: Boolean
    },
    hover: {
      type: Boolean
    },
    crop: {
      type: Boolean
    },
    fit: {
      type: Boolean
    },
    lazy: {
      type: Boolean
    },
    ratio: {
      type: Number,
      default: null
    },
    noPlaceholder: {
      type: Boolean
    },
    noOverlay: {
      type: Boolean
    },
    tooltipDelay: {
      type: Object,
      default: () => ({ show: 0, hide: 0 })
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
    classList() {
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
    style() {
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
    lazyLoadable() {
      return window && 'IntersectionObserver' in window
    },
    overlayIcon() {
      return this.errored ? 'eye-slash' : 'eye'
    },
    title() {
      return this.errored ? this.$t('documentThumbnail.noPreview') : ''
    },
    showImage() {
      return !!this.$config.get('previewHost') || this.canPreviewRaw(this.document)
    },
    showPlaceholder() {
      return !this.noPlaceholder && !this.loaded && this.document.contentTypeIcon
    },
    showOverlay() {
      return !this.noOverlay
    }
  },
  async mounted() {
    // This component can be deactivated globally
    if (!this.showImage) return
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
    sm: 90px,
    md: 150px,
    lg: 310px,
    xl: 720px,
    xxl: 960px
  );

  --height: var(--estimated-height, 0);
  --width: var(--height);

  color: var(--bs-secondary-color);
  min-width: var(--width);
  max-width: var(--width);
  min-height: var(--height);
  overflow: hidden;
  position: relative;

  @each $name, $value in $heights {
    &--#{$name} {
      --height: #{$value};
    }
  }

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
    background: $primary;
  }

  &--clickable {
    cursor: pointer;
  }

  &--clickable:hover,
  &--hover {
    .document-thumbnail__placeholder {
      display: none;
    }

    .document-thumbnail__overlay {
      display: flex;
    }
  }

  &--crop {
    height: var(--height);
    width: var(--width);
  }

  &--fit {
    width: 100%;
    max-width: 100%;
    min-width: auto;

    &.document-thumbnail--crop {
      position: relative;
      min-height: auto;
      height: auto;

      &:before {
        content: '';
        padding-bottom: 100%;
        display: block;
      }
    }
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
    z-index: $zindex-image;
  }

  &__placeholder {
    $zindex-placeholder: 0;
  }

  &__overlay {
    $zindex-overlay: 30;
  }

  &--hide-placeholder &__placeholder {
    display: none;
  }

  &__placeholder + &__overlay {
    background: var(--bs-tertiary-bg-subtle);
  }
}
</style>
