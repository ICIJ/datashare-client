<script setup>
import { pickBy } from 'lodash'
import { ref, useAttrs, useSlots } from 'vue'

import AppModal from './AppModal'

const inputValue = defineModel('inputValue', { type: String, default: '' })
const modelValue = defineModel({ type: Boolean })

defineProps({
  inputType: {
    type: String,
    default: 'text'
  },
  inputPlaceholder: {
    type: String,
    default: null
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
  },
  inputAutofocus: {
    type: Boolean,
    default: false
  },
  description: {
    type: String
  }
})

const inputModal = ref(null)

const attrs = useAttrs()
const slots = useSlots()
const otherSlots = pickBy(slots, (_, name) => name !== 'default')

const emit = defineEmits(['submit'])
const submit = () => emit('submit', { value: inputValue.value, trigger: 'submit' })
</script>

<template>
  <app-modal v-bind="attrs" v-model="modelValue" @ok="submit">
    <template #default="{ cancel, close, hide, ok, visible }">
      <div v-for="(fn, name) in otherSlots" :slot="name" :key="name">
        <component :is="fn" />
      </div>
      <slot v-bind="{ cancel, close, hide, ok, visible }">
        <div class="d-flex flex-column gap-3">
          <b-form-group
            :label="inputHiddenLabel"
            label-for="input-1"
            label-class="visually-hidden"
            :invalid-feedback="inputInvalidFeedback"
            :state="inputState"
          >
            <b-form-input
              id="input-1"
              ref="inputModal"
              v-model="inputValue"
              :type="inputType"
              :autofocus="inputAutofocus"
              :placeholder="inputPlaceholder"
            />
          </b-form-group>
          <p class="text-secondary-emphasis">
            <slot name="description">
              {{ description }}
            </slot>
          </p>
        </div>
      </slot>
    </template>
  </app-modal>
</template>
