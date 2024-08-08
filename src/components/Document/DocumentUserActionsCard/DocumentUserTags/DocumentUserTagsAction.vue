<script setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

import FormControlTag from '@/components/Form/FormControl/FormControlTag/FormControlTag'

defineOptions({ name: 'DocumentUserTagsAction' })

const modelValue = defineModel({ type: Array, required: true })
defineProps({
  options: {
    type: Array
  }
})

const emit = defineEmits(['update:tags'])
const { t } = useI18n()
const placeholder = t('documentUserTagsAction.placeholder')
const show = ref(false)
async function tagAdded($event) {
  show.value = !show.value
  emit('update:tags', $event)
  setTimeout(() => {
    show.value = !show.value
  }, 500)
}
</script>

<template>
  <div class="">
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
    <Transition name="fade" mode="out-in">
      <span v-if="show">Tag added</span>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter-from {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
}
</style>
