<script setup>
import { useId } from 'vue'
import { useRoute } from 'vue-router'
import { useModal } from 'bootstrap-vue-next'

import AppModal from '@/components/AppModal/AppModal'
import DocumentFloating from '@/components/Document/DocumentFloating'
import DocumentView from '@/views/Document/DocumentView/DocumentView'
import { onRouteLeaveNotMatch } from '@/composables/onRouteLeaveNotMatch'
import { onRouteUpdateNotMatch } from '@/composables/onRouteUpdateNotMatch'

const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  id: {
    type: String
  },
  routing: {
    type: String
  },
  index: {
    type: String
  },
  q: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const modalId = useId()
const { hide } = useModal(modalId)

onRouteLeaveNotMatch(route.name, () => hide())
onRouteUpdateNotMatch(route.name, () => hide())
</script>

<template>
  <app-modal
    :id="modalId"
    v-model="modelValue"
    class="document-modal"
    body-class="py-0"
    no-footer
    no-header
    no-header-close
    fullscreen
    lazy
  >
    <document-floating class="my-3" no-reduce no-expand>
      <slot>
        <document-view :id="id" :routing="routing" :index="index" :q="q" />
      </slot>
      <template #nav>
        <slot name="nav" />
      </template>
    </document-floating>
  </app-modal>
</template>

<style lang="scss">
.document-modal {
  &:not(:has(.document-floating--has-floating)) .document-floating__end {
    padding-left: 0;
  }

  .document-floating--reached-full-width {
    .document-floating__start__floating {
      margin-right: 0;
    }

    .document-floating__separator-line {
      display: none;
    }
  }
}
</style>
