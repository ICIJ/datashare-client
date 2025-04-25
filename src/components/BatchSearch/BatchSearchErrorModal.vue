<script setup>
import { computed, useAttrs, useSlots } from 'vue'

import AppModal from '@/components/AppModal/AppModal'
import JsonFormatter from '@/components/JsonFormatter'
import imageLight from '@/assets/images/illustrations/app-modal-error-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-error-dark.svg'
import ImageModeSource from '@/components/ImageMode/ImageModeSource'
const modelValue = defineModel({ type: Boolean, required: true })

const props = defineProps({
  query: {
    type: String
  },
  errorTitle: {
    type: String
  },
  errorMessage: {
    type: String
  },
  description: {
    type: String
  }
})
const attrs = useAttrs()
const imageHeaderLight = imageLight
const imageHeaderDark = imageDark
const errorMessageAsJson = computed(() => {
  const re = /{"error":.+}/gm
  const match = props.errorMessage?.match(re)
  try {
    return JSON.parse(match)
  } catch (_) {
    return null
  }
})
</script>

<template>
  <app-modal
    v-bind="attrs"
    v-model="modelValue"
    :image="imageHeaderLight"
    class="batch-search-error-modal"
    ok-only
    size="xl"
  >
    <template #header-image-source>
      <image-mode-source :src="imageHeaderDark" color-mode="dark" />
    </template>
    <div class="d-flex flex-column gap-2 mt-0 pt-0">
      <div class="d-flex justify-content-center pb-2">
        <span class="bg-tertiary-subtle rounded-1 p-2 text-center fw-medium">{{ query }}</span>
      </div>
      <p class="text-center fw-medium">
        {{ errorTitle }}
      </p>
      <template v-if="errorMessageAsJson">
        <json-formatter
          class="batch-search-error-modal__error-message"
          :json="errorMessageAsJson"
          :open="4"
          :config="{ theme: 'dark' }"
        />
      </template>
      <template v-else>
        <code class="bg-tertiary-subtle text-body-emphasis p-2 rounded-1">
          {{ errorMessage }}
        </code>
      </template>

      <p v-html="description" />
    </div>
  </app-modal>
</template>

<style lang="scss">
.batch-search-error-modal {
  a {
    font-weight: $font-weight-bold;
  }
  &__error-message {
    background-color: black;
    color: white;
    padding: $spacer;
    overflow: auto;

    code {
      white-space: normal;
      display: block;
    }
  }
}
</style>
