<script setup>
import { computed } from 'vue'
import { useLink } from 'vue-router'

import { useDocumentModal } from '@/composables/useDocumentModal'

const props = defineProps({
  name: {
    type: String,
    default: 'document-standalone'
  },
  index: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  routing: {
    type: String
  },
  q: {
    type: String
  },
  modal: {
    type: Boolean,
    default: false
  }
})

const { show: showDocumentModal } = useDocumentModal()

const to = computed(() => ({
  name: props.name,
  params: {
    index: props.index,
    id: props.id,
    routing: props.routing
  },
  query: {
    q: props.q
  }
}))

const { href, navigate } = useLink({ to })

const handleClick = (event) => {
  if (props.modal) {
    event.preventDefault()
    showDocumentModal(props.index, props.id, props.routing, props.q)
  }
  else {
    navigate(event)
  }
}
</script>

<template>
  <a
    :href="href"
    class="link-visitable"
    @click.exact="handleClick"
  >
    <slot />
  </a>
</template>
