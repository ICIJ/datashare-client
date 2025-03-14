<script setup>
import { provide } from 'vue'

import AppModalHeader from './AppModalHeader'
import AppModalFooter from './AppModalFooter'

import { breakpointSizeValidator, buttonSizeValidator, SIZE } from '@/enums/sizes'

// This tells every nested component they are in a modal
provide('modal', true)

const modelValue = defineModel({ type: Boolean })

defineProps({
  title: {
    type: String
  },
  image: {
    type: String
  },
  imageAlt: {
    type: String
  },
  imageWidth: {
    type: [Number, String],
    default: '60px'
  },
  buttonSize: {
    type: String,
    validator: buttonSizeValidator
  },
  cancelDisabled: {
    type: Boolean
  },
  cancelTitle: {
    type: String
  },
  cancelVariant: {
    type: String
  },
  okDisabled: {
    type: Boolean
  },
  okOnly: {
    type: Boolean
  },
  okTitle: {
    type: String
  },
  okVariant: {
    type: String
  },
  size: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  }
})
</script>

<template>
  <b-modal
    :button-size="buttonSize"
    :model-value="modelValue"
    :size="size"
    :title="title"
    class="app-modal"
  >
    <template #header="{ cancel, close, hide, ok, visible }">
      <slot name="header" v-bind="{ cancel, close, hide, ok, visible }">
        <app-modal-header :image="image" :image-alt="imageAlt" :image-width="imageWidth" :title="title" @close="close">
          <template #close>
            <slot name="header-close" />
          </template>
          <template #image>
            <slot name="header-image" />
          </template>
          <template #image-source>
            <slot name="header-image-source" />
          </template>
          <template #title>
            <slot name="title" />
          </template>
        </app-modal-header>
      </slot>
    </template>
    <template #footer="{ cancel, close, hide, ok, visible }">
      <slot name="footer" v-bind="{ cancel, close, hide, ok, visible }">
        <app-modal-footer
          :cancel-disabled="cancelDisabled"
          :cancel-title="cancelTitle"
          :cancel-variant="cancelVariant"
          :ok-disabled="okDisabled"
          :ok-only="okOnly"
          :ok-title="okTitle"
          :ok-variant="okVariant"
          @cancel="cancel"
          @ok="ok"
        />
      </slot>
    </template>
    <template #default="{ cancel, close, hide, ok, visible }">
      <slot v-bind="{ cancel, close, hide, ok, visible }" />
    </template>
  </b-modal>
</template>

<style lang="scss">
.app-modal {
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: $spacer-xxl;
    padding-right: $spacer-xxl;
  }

  .modal-header + .modal-body {
    padding-top: $spacer;
  }

  .modal-body + .modal-footer {
    padding-top: 0;
  }
}
</style>
