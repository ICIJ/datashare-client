<script setup>
import FormControlTag from '@/components/Form/FormControl/FormControlTag/FormControlTag'

defineOptions({ name: 'DocumentUserTagsAction' })

const modelValue = defineModel({ type: Array, required: true })

defineProps({
  options: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <form-control-tag
    v-model="modelValue"
    :options="options"
    class="w-100"
    no-duplicates
    no-tags
    no-clear
    :placeholder="$t('documentUserTagsAction.placeholder')"
  />
</template>
