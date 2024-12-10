<script setup>
import { useTemplateRef, getCurrentInstance, onMounted } from 'vue'

const element = useTemplateRef('element')

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  colorMode: {
    type: String,
    default: 'light'
  }
})

onMounted(() => {
  const { exposed } = getCurrentInstance()
  element.value.__exposed__ = exposed
})

defineExpose({ ...props })
</script>

<template>
  <source ref="element" class="image-mode-source" :src="src" />
</template>
