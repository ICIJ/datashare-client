<script setup>
import { useI18n } from 'vue-i18n'
import { onBeforeMount, ref } from 'vue'

import { useImage } from '@/composables/useImage'
import { useDocumentPreview } from '@/composables/useDocumentPreview'
import { useWait } from '@/composables/useWait'
import { useDocumentViewStore } from '@/store/modules/documentView'
import AppSpinner from '@/components/AppSpinner/AppSpinner'
import AppWait from '@/components/AppWait/AppWait'
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import DismissableContentWarning from '@/components/Dismissable/DismissableContentWarning'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const { rotateBase64Image } = useImage()
const { waitFor, loaderId } = useWait()
const { computedDocumentRotation } = useDocumentViewStore()
const { isBlurred } = useDocumentPreview()

const blurred = ref(null)
const imageBase64 = ref(null)
const imageRotation = computedDocumentRotation(props.document)

async function fetch() {
  blurred.value = blurred.value ?? await isBlurred(props.document)
  imageBase64.value = await rotateBase64Image(props.document.inlineFullUrl, imageRotation)
}

async function rotateClockwise() {
  imageRotation.value = (imageRotation.value + 90) % 360
  return fetch()
}

async function rotateCounterClockwise() {
  imageRotation.value = (imageRotation.value - 90 + 360) % 360
  return fetch()
}

onBeforeMount(waitFor(fetch))
</script>

<template>
  <app-wait
    class="image-viewer mx-auto p-3"
    :for="loaderId"
  >
    <template #waiting>
      <app-spinner />
    </template>
    <div class="image-viewer__wrapper">
      <div class="image-viewer__wrapper__controls">
        <button-row-action
          class="image-viewer__wrapper__controls__button"
          :label="t('documentViewerImage.rotateCounterClockwise')"
          :icon-left="PhArrowCounterClockwise"
          @click="rotateCounterClockwise()"
        />
        <button-row-action
          class="image-viewer__wrapper__controls__button"
          :label="t('documentViewerImage.rotateClockwise')"
          :icon-left="PhArrowClockwise"
          @click="rotateClockwise()"
        />
      </div>
      <dismissable-content-warning
        v-model:show="blurred"
        hide-content
        no-center
      >
        <img
          :src="imageBase64"
          class="image-viewer__wrapper__image img-fluid"
        >
      </dismissable-content-warning>
    </div>
  </app-wait>
</template>

<style scoped lang="scss">
.image-viewer {
  width: 100%;
  text-align: center;

  &__wrapper {
    position: relative;
    overflow: hidden;
    width: 100%;

    &__controls {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      opacity: 0.25;
      display: flex;
      justify-content: center;
      gap: $spacer-xxs;

      &:hover {
        opacity: 1;
      }

      &__button {
        --bs-btn-bg: var(--bs-btn-hover-bg);
        --bs-btn-active-shadow: none;
      }
    }
  }
}
</style>
