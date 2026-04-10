<script setup>
import { useI18n } from 'vue-i18n'

import DismissableAlertEditable from '@/components/Dismissable/DismissableAlertEditable.vue'
import DismissableContentWarningToggler from '@/components/Dismissable/DismissableContentWarningToggler.vue'

const { t } = useI18n()

const variant = defineModel('variant', {
  type: String,
  default: 'info'
})

const modelValue = defineModel({
  type: String
})

const sensitive = defineModel('sensitive', {
  type: Boolean,
  default: false
})

defineProps({
  path: {
    type: String
  },
  placeholder: {
    type: String
  }
})
</script>

<template>
  <div class="path-banner-preview border-top border-subtle pt-2 d-flex flex-column">
    <p class="fw-semibold">
      {{ t('projectViewEdit.pathBanners.previewTitle') }}
      <code v-if="path">{{ path }}</code>
      <code
        v-else
        class="fst-italic"
      >{{ t('projectViewEdit.pathBanners.noPathSelected') }}</code>
    </p>
    <div class="d-flex justify-content-around gap-2 px-1 flex-column col-12 col-lg-8 align-self-center">
      <dismissable-alert-editable
        v-model="modelValue"
        v-model:variant="variant"
        :placeholder="placeholder"
      />
      <dismissable-content-warning-toggler
        v-if="sensitive"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.path-banner-preview {
  :deep(input) {
    color: inherit;
  }
}
</style>
