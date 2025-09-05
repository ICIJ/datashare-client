<script setup>
import DisplayTags from '@/components/Display/DisplayTags'
import ButtonTag from '@/components/Button/ButtonTag'

defineOptions({ name: 'DisplayTagsSearchParameter' })

defineProps({
  value: {
    type: [Array, String]
  },
  noXIcon: {
    type: Boolean
  }
})
const emit = defineEmits(['delete'])
</script>

<template>
  <display-tags :value="value">
    <template #content="{ content: label }">
      <button-tag
        :label="label"
        @delete="emit('delete', label)"
      />
    </template>
  </display-tags>
</template>
