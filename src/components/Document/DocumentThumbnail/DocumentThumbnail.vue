<script setup>
import { computed, ref, onBeforeMount, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIntersectionObserver } from '@vueuse/core'

import DocumentThumbnailImage from '@/components/Document/DocumentThumbnail/DocumentThumbnailImage'
import DocumentThumbnailPlaceholder from '@/components/Document/DocumentThumbnail/DocumentThumbnailPlaceholder'
import DocumentThumbnailOverlay from '@/components/Document/DocumentThumbnail/DocumentThumbnailOverlay'
import { useDocumentPreview } from '@/composables/useDocumentPreview'

const props = defineProps({
  document: {
    type: Object,
    required: true
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
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  hover: {
    type: Boolean,
    default: false
  },
  crop: {
    type: Boolean,
    default: false
  },
  fit: {
    type: Boolean,
    default: false
  },
  lazy: {
    type: Boolean,
    default: false
  },
  ratio: {
    type: Number,
    default: null
  },
  noPlaceholder: {
    type: Boolean,
    default: false
  },
  noOverlay: {
    type: Boolean,
    default: false
  },
  tooltipDelay: {
    type: Object,
    default() {
      return { show: 0, hide: 0 }
    }
  }
})

const emit = defineEmits(['loaded', 'errored', 'enter'])

const errored = ref(false)
const thumbnailSrc = ref(null)

const { isPreviewActivated, getPreviewUrl, fetchImageAsBase64, canPreviewRaw } = useDocumentPreview()
const { t } = useI18n()
const element = useTemplateRef('element')

const classList = computed(() => {
  return {
    'document-thumbnail--hide-placeholder': props.noPlaceholder,
    'document-thumbnail--active': props.active,
    'document-thumbnail--crop': props.crop,
    'document-thumbnail--fit': props.fit,
    'document-thumbnail--errored': errored.value,
    'document-thumbnail--loaded': !!thumbnailSrc.value,
    'document-thumbnail--clickable': props.clickable,
    'document-thumbnail--hover': props.hover,
    [`document-thumbnail--${props.size}`]: isNaN(props.size)
  }
})

const style = computed(() => {
  return {
    '--estimated-ratio': props.ratio,
    '--estimated-height': isNaN(props.size) ? null : `${props.size}px`
  }
})

const thumbnailUrl = computed(() => {
  const { index, id, routing } = props.document
  const { page, size } = props
  return getPreviewUrl({ index, id, routing }, { page, size })
})

const thumbnailAlt = computed(() => `${props.document.basename} preview`)
const lazyLoadable = computed(() => window && 'IntersectionObserver' in window)
const overlayIcon = computed(() => (errored.value ? 'eye-slash' : 'eye'))
const title = computed(() => (errored.value ? t('documentThumbnail.noPreview') : ''))

const showImage = computed(() => isPreviewActivated.value || canPreviewRaw(props.document))
const showPlaceholder = computed(() => !props.noPlaceholder && !thumbnailSrc.value)
const showOverlay = computed(() => !props.noOverlay)

function fetchAsBase64() {
  const url = canPreviewRaw(props.document) ? props.document.inlineFullUrl : thumbnailUrl.value
  return fetchImageAsBase64(url)
}

async function fetchAndLoad() {
  try {
    if (!thumbnailSrc.value && !errored.value) {
      thumbnailSrc.value = await fetchAsBase64()
      emit('loaded')
    }
  } catch (_) {
    errored.value = true
    emit('errored')
  }
}

useIntersectionObserver(element, async ([entry]) => {
  if (entry.isIntersecting) {
    emit('enter', entry)
    // Fetch the thumbnail
    await fetchAndLoad()
  }
})

onBeforeMount(() => {
  // This component can be deactivated globally
  if (!showImage.value) return
  // This component can be lazy loaded
  if (props.lazy && lazyLoadable.value) return
  // Fetch directly
  fetchAndLoad()
})
</script>

<template>
  <div
    ref="element"
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
