<script setup>
import { useI18n } from 'vue-i18n'
import { onBeforeMount, ref } from 'vue'

import { useImage } from '@/composables/useImage'
import { useWait } from '@/composables/useWait'
import { useDocumentViewStore } from '@/store/modules/documentView'
import AppSpinner from '@/components/AppSpinner/AppSpinner'
import AppWait from '@/components/AppWait/AppWait'
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

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

const imageBase64 = ref(null)
const imageRotation = computedDocumentRotation(props.document)

async function fetch() {
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
  <app-wait class="image-viewer mx-auto p-3" :for="loaderId">
    <template #waiting>
      <app-spinner />
    </template>
    <div class="image-viewer__wrapper">
      <div class="image-viewer__wrapper__controls justify-content-center d-flex gap-1 p-1">
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
      <img :src="imageBase64" class="image-viewer__wrapper__image img-fluid" />
    </div>
  </app-wait>
</template>

<style scoped lang="scss">
.image-viewer {
  &__wrapper {
    position: relative;

    &__controls {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      opacity: 0.25;

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
