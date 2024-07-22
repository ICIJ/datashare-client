<template>
  <icon-button
    :id="btnId"
    :icon-left="iconName"
    :icon-left-weight="iconWeight"
    class="btn"
    :class="btnClassDefinition"
    :tooltip-placement="tooltipPlacement"
    :label="label"
    hide-label
    :disabled="disabled"
  />
</template>

<script setup>
import { computed } from 'vue'
import uniqueId from 'lodash/uniqueId'

import IconButton from '@/components/IconButton'

defineOptions({ name: 'DocumentActionsButton' })
const props = defineProps({
  /**
   * Icon name
   */
  iconName: {
    type: String,
    required: true
  },
  /**
   * Button label
   */
  label: {
    type: String,
    default: ''
  },
  /**
   * Class to apply to the action button
   */
  btnClass: {
    type: String,
    default: 'btn-link btn-sm'
  },
  /**
   * Button is filled
   */
  isFilled: {
    type: Boolean
  },
  /**
   * Class to apply to the action button when document is filled
   */
  filledBtnClass: {
    type: String,
    default: 'starred'
  },
  /**
   * Class to apply to the action button when document is filled
   */
  tooltipPlacement: {
    type: String,
    default: 'top'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const btnId = uniqueId('action-btn-')
const btnClassDefinition = computed(() => {
  return {
    [props.btnClass]: props.isFilled,
    ...classAttributeToObject(props.btnClass)
  }
})
function classAttributeToObject(str) {
  const list = str.split(' ')
  return Object.assign({}, ...list.map((key) => ({ [key]: true })))
}

const iconWeight = computed(() => (props.isFilled ? 'fill' : 'regular'))
</script>
