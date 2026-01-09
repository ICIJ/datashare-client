<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppIcon } from '@icij/murmur-next'

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
    <app-icon
      v-if="!noIcon && icon"
      class="me-2"
      :name="icon"
    />
    <app-icon
      v-else
      class="opacity-25 me-2"
    >
      <i-ph-caret-right />
    </app-icon>
    <slot :route="to">
      <display-route :value="to" />
    </slot>
  </b-dropdown-item>
</template>
