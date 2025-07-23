<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
</script>

<template>
  <div class="document-viewer-pdf-embedded d-flex flex-column gap-3 my-3">
    <button-icon
      class="document-viewer-pdf-embedded__button align-self-end"
      :icon-left="PhFilePdf"
      :label="t('documentViewerPdfEmbedded.switch')"
      @click="modelValue = false"
    />
    <iframe
      :src="document.inlineFullUrl"
      class="document-viewer-pdf-embedded__iframe rounded"
      frameborder="0"
      allowfullscreen
    />
  </div>
</template>

<style scoped lang="scss">
.document-viewer-pdf-embedded {
  width: 100%;

  &__iframe {
    width: 100%;
    height: calc(100vh - #{$spacer});
    min-height: 500px;
    border: none;
  }
}
</style>
