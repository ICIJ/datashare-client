<script setup>
import FormControlTag from '@/components/Form/FormControl/FormControlTag/FormControlTag'

defineOptions({ name: 'DocumentUserTagsAction' })

const modelValue = defineModel({ type: Array, required: true })

defineProps({
  disabled: {
    type: Boolean
  },
  options: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <form-control-tag
    v-model="modelValue"
    :disabled="disabled"
    :options="options"
    class="document-user-tags-actions w-100"
    autofocus
    no-duplicates
    no-tags
    no-clear
    :placeholder="$t('documentUserTagsAction.placeholder')"
  />
</template>
