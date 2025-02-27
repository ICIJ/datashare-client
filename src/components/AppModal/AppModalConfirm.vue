<script setup>
import { useAttrs } from 'vue'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'

import AppModal from '@/components/AppModal/AppModal'

defineProps({
  description: {
    type: String,
    default: null
  }
})

const attrs = useAttrs()
</script>

<template>
  <app-modal v-bind="attrs" :image="image" :image-dark="imageDark" :title="$t('appModalConfirm.title')" size="410px">
    <slot>
      {{ description || $t('appModalConfirm.description') }}
    </slot>
  </app-modal>
</template>
