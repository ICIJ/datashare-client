<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

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

const router = useRouter()
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

const href = computed(() => {
  const { href } = router.resolve(to.value)
  return href
})

const handleClick = (event) => {
  if (props.modal) {
    event.preventDefault()
    showDocumentModal(props.index, props.id, props.routing, props.q)
  }
}
</script>

<template>
  <a :href="href" class="link-visitable" @click.exact="handleClick">
    <slot />
  </a>
</template>
