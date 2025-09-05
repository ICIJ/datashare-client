<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import DisplayRoute from '@/components/Display/DisplayRoute'

const props = defineProps({
  to: {
    type: Object,
    required: true
  },
  noIcon: {
    type: Boolean,
    default: false
  },
  icon: {
    type: [String, Object, Array],
    default: null
  }
})

const router = useRouter()

const resolved = computed(() => {
  try {
    return router.resolve(props.to)
  }
  catch {
    return null
  }
})

const icon = computed(() => {
  return props.icon ?? resolved.value?.meta?.icon
})
</script>

<template>
  <b-dropdown-item :href="resolved.href">
    <phosphor-icon
      v-if="!noIcon && icon"
      class="me-2"
      :name="icon"
    />
    <phosphor-icon
      v-else
      class="opacity-25 me-2"
      :name="PhCaretRight"
    />
    <slot :route="to">
      <display-route :value="to" />
    </slot>
  </b-dropdown-item>
</template>
