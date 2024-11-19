<script setup>
import AppModalHeader from './AppModalHeader'
import AppModalFooter from './AppModalFooter'

import { breakpointSizeValidator, buttonSizeValidator, SIZE } from '@/enums/sizes'

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
    type: String,
    default: '60px'
  },
  autofocus: {
    type: Boolean
  },
  bodyClass: {
    type: String
  },
  busy: {
    type: Boolean
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
  centered: {
    type: Boolean
  },
  contentClass: {
    type: String
  },
  dialogClass: {
    type: String
  },
  footerBgVariant: {
    type: String
  },
  footerClass: {
    type: String
  },
  footerTextVariant: {
    type: String
  },
  footerBorderVariant: {
    type: String
  },
  footerVariant: {
    type: String
  },
  fullscreen: {
    type: Boolean
  },
  headerBgVariant: {
    type: String
  },
  headerBorderVariant: {
    type: String
  },
  headerClass: {
    type: String
  },
  hideBackdrop: {
    type: Boolean
  },
  hideFooter: {
    type: Boolean
  },
  hideHeader: {
    type: Boolean
  },
  id: {
    type: String
  },
  lazy: {
    type: Boolean
  },
  modalClass: {
    type: String
  },
  modelValue: {
    type: Boolean
  },
  noCloseOnBackdrop: {
    type: Boolean
  },
  noCloseOnEsc: {
    type: Boolean
  },
  noFade: {
    type: Boolean
  },
  noStacking: {
    type: Boolean
  },
  noTrap: {
    type: Boolean
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
  scrollable: {
    type: Boolean
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
    :id="id"
    :autofocus="autofocus"
    :body-class="bodyClass"
    :busy="busy"
    :button-size="buttonSize"
    :cancel-disabled="cancelDisabled"
    :cancel-title="cancelTitle"
    :cancel-variant="cancelVariant"
    :centered="centered"
    :content-class="contentClass"
    :dialog-class="dialogClass"
    :footer-bg-variant="footerBgVariant"
    :footer-border-variant="footerBorderVariant"
    :footer-class="footerClass"
    :footer-text-variant="footerTextVariant"
    :footer-variant="footerVariant"
    :fullscreen="fullscreen"
    :header-bg-variant="headerBgVariant"
    :header-border-variant="headerBorderVariant"
    :header-class="headerClass"
    :hide-backdrop="hideBackdrop"
    :hide-footer="hideFooter"
    :hide-header="hideHeader"
    :lazy="lazy"
    :modal-class="modalClass"
    :model-value="modelValue"
    :no-close-on-backdrop="noCloseOnBackdrop"
    :no-close-on-esc="noCloseOnEsc"
    :no-fade="noFade"
    :no-stacking="noStacking"
    :no-trap="noTrap"
    :ok-disabled="okDisabled"
    :ok-only="okOnly"
    :ok-title="okTitle"
    :ok-variant="okVariant"
    :scrollable="scrollable"
    :size="size"
    class="app-modal"
    :title="title"
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
    <slot />
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
