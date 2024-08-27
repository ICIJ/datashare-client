<script setup>
import { useAttrs, useSlots } from 'vue'

import AppModal from './AppModal'
const inputValue = defineModel('inputValue', { type: String, required: true })
const modelValue = defineModel({ type: Boolean, required: true })
defineProps({
  inputType: {
    type: String,
    default: 'text'
  },
  inputPlaceholder: {
    type: String,
    default: null
  },
  description: {
    type: String
  },
  inputState: {
    type: Boolean,
    default: true
  },
  inputHiddenLabel: {
    type: String
  },
  inputInvalidFeedback: {
    type: String
  }
})
// Retrieve all slots passed to AppModalPrompt to pass them to AppModal
const slots = useSlots()
const slots_ = Object.fromEntries(Object.entries(slots).filter(([name]) => name !== 'default'))
const attrs = useAttrs() // This will forward any props passed to AppModalPrompt to AppModal

const emits = defineEmits(['submit'])
const onOk = () => {
  emits('submit', { value: inputValue.value })
}
</script>

<template>
  <app-modal v-bind="attrs" v-model="modelValue" @ok="onOk">
    <template v-for="(slotFn, slotName) in slots_" :slot="slotName" :key="slotName">
      <!-- Dynamically render named slots -->
      <component :is="slotFn" />
    </template>
    <template v-if="slots.default">
      <div class="d-flex flex-column gap-3">
        <b-form-group
          :label="inputHiddenLabel"
          label-for="input-1"
          label-class="visually-hidden"
          :invalid-feedback="inputInvalidFeedback"
          :state="inputState"
        >
          <b-form-input id="input-1" v-model="inputValue" :type="inputType" :placeholder="inputPlaceholder" />
        </b-form-group>
        <p class="text-secondary-emphasis">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
    </template>
  </app-modal>
</template>
