<template>
  <icon-button
    :id="btnId"
    :icon-left="icon"
    :icon-left-weight="iconWeight"
    :icon-left-hover-weight="iconHoverWeight"
    :label="label"
    hide-label
    :tooltipPlacement="tooltipPlacement"
    square
    variant="outline-tertiary"
    class="document-actions-entry border-0 "
    :class="{'document-actions-entry--filled': isFilled}"
    :disabled="disabled"
  />
</template>

<script setup>
import { computed } from 'vue'
import uniqueId from 'lodash/uniqueId'

import IconButton from '@/components/IconButton'

defineOptions({ name: 'DocumentActionsEntry' })
const props = defineProps({
  /**
   * Icon name
   */
  icon: {
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
    default: 'btn-sm'
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
  tooltipPlacement: {
    type: String,
    default: 'bottom'
  },
  /**
   * Disable button 
   */
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
const iconHoverWeight = computed(() => (props.isFilled ? 'fill' : 'bold'))
</script>
<style lang="scss" scoped>

.document-actions-entry  {
  &--filled {
    color: $primary;
  }
  &:hover{
    color : $primary;
  }
  // this will compile to: --pf-primary-color: #000000;
}
</style>