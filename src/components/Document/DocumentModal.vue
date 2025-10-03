<script setup>
import { computed, useId, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { useModal } from 'bootstrap-vue-next'

import AppModal from '@/components/AppModal/AppModal'
import DocumentFloating from '@/components/Document/DocumentFloating'
import DocumentView from '@/views/Document/DocumentView/DocumentView'
import { onRouteLeaveNotMatch } from '@/composables/onRouteLeaveNotMatch'
import { onRouteUpdateNotMatch } from '@/composables/onRouteUpdateNotMatch'
import { useCompact } from '@/composables/useCompact'
import { DISPLAY } from '@/enums/documentFloating'

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
const documentFloatingRef = useTemplateRef('document-floating')
const { hide } = useModal(modalId)
const { compact } = useCompact(documentFloatingRef, { threshold: 900 })
const display = computed(() => compact.value ? DISPLAY.END : DISPLAY.BOTH)

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
    <document-floating
      ref="document-floating"
      class="my-3"
      :display="display"
      no-reduce
      no-expand
    >
      <slot>
        <document-view
          :id="id"
          :routing="routing"
          :index="index"
          :q="q"
          :compact="compact"
        />
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
