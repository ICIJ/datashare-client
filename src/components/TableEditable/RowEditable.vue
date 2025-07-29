<template>
  <div class="d-flex">
    <div
      v-if="!isEditing"
      class="editable-row mx-3"
      @click="startEditing"
    >
      <i v-if="showPlaceholder">{{ placeholder }}</i>
      <span v-else>{{ cellValue }}</span>
    </div>
    <b-form-input
      v-else
      ref="inputRef"
      v-model="cellValue"
      class="editable-row"
      type="text"
      @focus="$event.target.select()"
      @focusout.prevent="stopEditing"
      @keypressed.enter="stopEditing"
      @keyup.esc="stopEditing"
    />
  </div>
</template>

<script setup>
import { nextTick, useTemplateRef, computed, watch } from 'vue'

const cellValue = defineModel({
  type: String,
  default: ''
})

const isEditing = defineModel('focused', {
  type: Boolean,
  default: false
})

defineProps({
  placeholder: {
    type: String,
    default: 'Enter your query here'
  }
})

const inputRef = useTemplateRef('inputRef')
watch(
  isEditing,
  async (value) => {
    if (value) {
      await nextTick()
      inputRef.value?.focus()
    }
  },
  { immediate: true }
)

const showPlaceholder = computed(() => {
  return cellValue.value.length === 0
})
const startEditing = async () => {
  isEditing.value = true
}

const stopEditing = () => {
  isEditing.value = false
}
</script>

<style scoped>
div {
  cursor: pointer;
}

.editable-row {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 40px;
  width: 100%;
}
</style>
