<script setup>
import { computed, ref, onBeforeMount, useTemplateRef } from 'vue'
import { useElementVisibility, whenever } from '@vueuse/core'

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
    type: String,
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
  aspectRatio: {
    type: Number,
    default: 1
  },
  noPlaceholder: {
    type: Boolean,
    default: false
  },
  noOverlay: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['loaded', 'errored', 'enter'])

const errored = ref(false)
const thumbnail = ref(null)

const { isPreviewActivated, getPreviewUrl, fetchImageDimensionsWithAuth, canPreviewRaw } = useDocumentPreview()
const element = useTemplateRef('element')

const classList = computed(() => {
  return {
    'document-thumbnail--active': props.active,
    'document-thumbnail--crop': props.crop,
    'document-thumbnail--fit': props.fit,
    'document-thumbnail--errored': errored.value,
    'document-thumbnail--loaded': !!thumbnail.value,
    'document-thumbnail--clickable': props.clickable,
    'document-thumbnail--hover': props.hover,
    [`document-thumbnail--${props.size}`]: isNaN(props.size)
  }
})

const thumbnailUrl = computed(() => {
  const { index, id, routing } = props.document
  const { page, size } = props
  return getPreviewUrl({ index, id, routing }, { page, size })
})

const alt = computed(() => `${props.document.basename} preview`)
const overlayIcon = computed(() => (errored.value ? 'eye-slash' : 'eye'))

const activated = computed(() => isPreviewActivated.value || canPreviewRaw(props.document))
const showImage = computed(() => !!thumbnail.value)
const showPlaceholder = computed(() => !props.noPlaceholder && !thumbnail.value)
const showOverlay = computed(() => !props.noOverlay)

const style = computed(() => {
  return {
    '--document-thumbnail-width': thumbnail.value?.width ?? null,
    '--document-thumbnail-aspect-ratio': thumbnail.value
      ? thumbnail.value.width / thumbnail.value.height
      : props.aspectRatio
  }
})

async function fetchThumbnail() {
  try {
    if (!thumbnail.value && !errored.value && activated.value) {
      const url = canPreviewRaw(props.document) ? props.document.inlineFullUrl : thumbnailUrl.value
      thumbnail.value = await fetchImageDimensionsWithAuth(url)
      emit('loaded')
    }
  } catch (_) {
    errored.value = true
    emit('errored')
  }
}

async function enter() {
  emit('enter', element.value)
  await fetchThumbnail()
}

const isVisible = useElementVisibility(element)
// Fetch the image when the element is visible but only once (and immediately if lazy is true)
whenever(isVisible, enter, { immediate: props.lazy, once: true })

onBeforeMount(async () => {
  // This component can be deactivated globally
  if (!showImage.value) return
  // This component can be lazy loaded
  if (props.lazy) return
  // Fetch directly
  await fetchThumbnail()
})
</script>

<template>
  <div ref="element" class="document-thumbnail" :class="classList" :style="style">
    <document-thumbnail-image
      v-if="showImage"
      class="document-thumbnail__image"
      :alt="alt"
      :src="thumbnail.base64"
      :height="thumbnail.height"
      :width="thumbnail.width"
      :crop="crop"
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

  $fontSizes: (
    xs: 1.5rem,
    sm: 2rem,
    md: 2.5rem,
    lg: 3rem,
    xl: 3.5rem,
    xxl: 4rem
  );

  color: var(--bs-secondary-color);
  overflow: hidden;
  position: relative;

  @each $name, $value in $heights {
    &--#{$name} {
      font-size: map-get($fontSizes, $name);
      width: $value;
      max-width: 100%;
      aspect-ratio: var(--document-thumbnail-aspect-ratio, 1);
    }
  }

  &--crop {
    aspect-ratio: 1;
  }

  &--fit:not(&--errored).document-thumbnail--loaded {
    width: 100%;
    max-width: calc(var(--document-thumbnail-width) * 1px);
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

  &--loaded:not(&--errored) &__image {
    opacity: 1;
  }

  &__image {
    z-index: $zindex-image;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  &__placeholder {
    $zindex-placeholder: 0;
  }

  &__overlay {
    $zindex-overlay: 30;
  }

  &__placeholder + &__overlay {
    background: var(--bs-tertiary-bg-subtle);
  }
}
</style>
