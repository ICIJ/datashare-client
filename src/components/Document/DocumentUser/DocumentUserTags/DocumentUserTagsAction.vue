<script setup>
import { useI18n } from 'vue-i18n'

import FormControlTag from '@/components/Form/FormControl/FormControlTag/FormControlTag'

defineOptions({ name: 'DocumentUserTagsAction' })

const modelValue = defineModel({ type: Array, required: true })
defineProps({
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:tags'])
const { t } = useI18n()
const placeholder = t('documentUserTagsAction.placeholder')
async function tagAdded($event) {
  emit('update:tags', $event)
}
</script>

<template>
  <div>
    <form-control-tag
      v-model="modelValue"
      :options="options"
      class="d-flex-grow-1"
      :placeholder="placeholder"
      no-duplicates
      no-clear
      no-tags
      @update:model-value="tagAdded"
    />
  </div>
</template>
