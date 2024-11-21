<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  label: {
    type: String
  },
  icon: {
    type: [String, Object, Array],
  },
  href: {
    type: String
  },
  target: {
    type: String
  },
  to: {
    type: Object
  },
  variant: {
    type: String,
    default: 'action'
  }
})
</script>

<template>
  <button-icon :icon-right="icon" :href="href" :to="to" :target="target" class="px-4 py-2" :variant="variant">
    <slot>
      {{ label }}
    </slot>
  </button-icon>
</template>
