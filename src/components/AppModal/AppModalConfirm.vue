<script setup>
import { useAttrs } from 'vue'

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
  <app-modal v-bind="attrs" :title="$t('appModalConfirm.title')" size="md">
    <slot>
      {{ description || $t('appModalConfirm.description') }}
    </slot>
  </app-modal>
</template>
