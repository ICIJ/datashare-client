<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhCaretDown from '~icons/ph/caret-down'
import IPhCaretUp from '~icons/ph/caret-up'

const props = defineProps({
  collapse: {
    type: Boolean
  }
})

const { t } = useI18n()
const emit = defineEmits(['update:collapse'])
const toggle = () => emit('update:collapse', !props.collapse)
const icon = computed(() => (props.collapse ? IPhCaretDown : IPhCaretUp))
const label = computed(() => {
  return props.collapse ? t('formStepGroupToggler.expand') : t('formStepGroupToggler.collapse')
})
</script>

<template>
  <button-icon
    class="form-step-group-toggler border-secondary flex-shrink-0"
    hide-tooltip
    truncate
    :icon-right="icon"
    :label="label"
    variant="outline-secondary"
    @click="toggle"
  />
</template>
