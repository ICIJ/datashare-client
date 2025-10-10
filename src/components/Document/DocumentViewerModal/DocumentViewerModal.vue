<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { computed, ref, toRef, useId, watch } from 'vue'
import { useModal } from 'bootstrap-vue-next'

import DocumentViewerModalTitle from './DocumentViewerModalTitle'
import DocumentViewerModalNav from './DocumentViewerModalNav'

import AppModal from '@/components/AppModal/AppModal'
import DismissableContentWarning from '@/components/Dismissable/DismissableContentWarning'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'
import { useContrastVariant } from '@/composables/useContrastVariant'
import { useDocumentPreview } from '@/composables/useDocumentPreview'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { variant, variantCss } = useContrastVariant({ dark: 'darker' })
const { isBlurred } = useDocumentPreview()

const document = ref(props.document)
const blurred = ref(true)

// We track this compositive document key to force the thumbnail to re-render when the document changes
const key = computed(() => [document.value.index, document.value.id].join('-'))
// Document ref must stay in sync with the prop
watch(toRef(props, 'document'), value => (document.value = value), { immediate: true })
// Whenever the document changes, we need to check if it is blurred
watch(document, async () => (blurred.value = await isBlurred(document.value)))

const modalId = useId()
const { hide } = useModal(modalId)
// Auto-hide the modal when we leave the route
onBeforeRouteLeave(() => hide())
// Auto-hide the modal when we update the route to a child route that is not 'search'
onBeforeRouteUpdate(({ name }) => name !== 'search' && hide())
</script>

<template>
  <app-modal
    :id="modalId"
    class="document-viewer-modal"
    content-class="shadow-none"
    :body-bg-variant="variant"
    body-class="rounded-bottom"
    :header-variant="variant"
    header-class="document-viewer-modal__header"
    no-footer
    size="lg"
  >
    <template #title>
      <document-viewer-modal-title :document="document" />
    </template>
    <document-viewer-modal-nav v-model:document="document" />
    <dismissable-content-warning
      :key="key"
      v-model:show="blurred"
      class="my-3"
      :bg-color="variantCss"
    >
      <document-thumbnail
        :document="document"
        size="xl"
        no-blur
        fit
      />
    </dismissable-content-warning>
  </app-modal>
</template>
