<script setup>
import { computed, ref } from 'vue'
import { ButtonIcon } from '@icij/murmur-next'

import IPhEye from '~icons/ph/eye'
import IPhEyeSlash from '~icons/ph/eye-slash'

defineOptions({
  name: 'FormInputPassword',
  inheritAttrs: false
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const type = computed(() => (visible.value ? 'text' : 'password'))
const icon = computed(() => (visible.value ? IPhEyeSlash : IPhEye))

function toggleVisibility() {
  visible.value = !visible.value
}
</script>

<template>
  <div class="form-input-password input-group flex-nowrap">
    <b-input
      v-bind="$attrs"
      :type="type"
      class="form-input-password__input border-end-0"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <span class="form-input-password__end input-group-text border-start-0">
      <button-icon
        :icon-left="icon"
        hide-label
        variant="outline-secondary"
        class="form-input-password__toggle p-1 border-0"
        @click="toggleVisibility"
      />
    </span>
  </div>
</template>
