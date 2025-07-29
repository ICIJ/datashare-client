<script setup>
import { computed, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImageModeSource } from '@icij/murmur-next'

import AppModal from '@/components/AppModal/AppModal'
import JsonFormatter from '@/components/JsonFormatter'
import imageHeaderLight from '@/assets/images/illustrations/app-modal-error-light.svg'
import imageHeaderDark from '@/assets/images/illustrations/app-modal-error-dark.svg'

const modelValue = defineModel({ type: Boolean, required: true })

const props = defineProps({
  errorQuery: {
    type: String
  },
  errorMessage: {
    type: String
  }
})

const attrs = useAttrs()
const { t } = useI18n()

const errorMessageAsJson = computed(() => {
  const re = /{"error":.+}/gm
  const match = props.errorMessage?.match(re)
  try {
    return JSON.parse(match)
  }
  catch (_) {
    return null
  }
})
</script>

<template>
  <app-modal
    v-bind="attrs"
    v-model="modelValue"
    :image="imageHeaderLight"
    :image-width="70"
    :ok-title="t('batchSearchErrorModal.okTitle')"
    class="batch-search-error-modal"
    ok-only
    size="lg"
  >
    <template #header-image-source>
      <image-mode-source
        :src="imageHeaderDark"
        color-mode="dark"
      />
    </template>
    <div class="d-flex flex-column gap-4 mt-0 pt-0">
      <div
        v-if="errorQuery"
        class="text-center"
      >
        <p class="text-center fw-medium">
          {{ t('batchSearchErrorModal.errorQuery') }}
        </p>
        <div>
          <span class="bg-tertiary-subtle rounded-1 p-2 text-center fw-medium">
            {{ errorQuery }}
          </span>
        </div>
      </div>
      <div>
        <p class="text-center fw-medium">
          {{ t('batchSearchErrorModal.errorTitle') }}
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
          <div class="bg-tertiary-subtle d-block text-body-emphasis m-0 rounded-1">
            <pre class="p-3 m-0"><code>{{ errorMessage }}</code></pre>
          </div>
        </template>
      </div>
      <i18n-t
        keypath="batchSearchErrorModal.description"
        tag="p"
        class="m-0"
      >
        <template #link>
          <a
            href="https://icij.gitbook.io/datashare/usage/faq/common-errors/list-of-common-errors-leading-to-failure-in-batch-searches"
            target="_blank"
            rel="noopener"
          >
            <i18n-t keypath="batchSearchErrorModal.text" />
          </a>
        </template>
      </i18n-t>
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
