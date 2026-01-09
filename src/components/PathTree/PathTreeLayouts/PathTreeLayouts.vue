<script setup>
import { LAYOUTS, layoutValidator } from '@/enums/pathTree'
import { AppIcon } from '@icij/murmur-next'

const modelValue = defineModel('modelValue', {
  type: String,
  default: LAYOUTS.TREE,
  validator: layoutValidator
})

defineProps({
  /**
   * Name attribute for the radio group
   */
  name: {
    type: String,
    default: 'path-tree-layouts'
  }
})
</script>

<template>
  <div class="path-tree-layouts">
    <b-form-radio-group
      v-model="modelValue"
      :name="name"
    >
      <b-form-radio :value="LAYOUTS.TREE">
        <app-icon><i-ph-tree-view /></app-icon> {{ $t('pathTreeLayouts.tree') }}
      </b-form-radio>
      <b-form-radio :value="LAYOUTS.LIST">
        <app-icon><i-ph-list-bullets /></app-icon> {{ $t('pathTreeLayouts.list') }}
      </b-form-radio>
      <b-form-radio :value="LAYOUTS.GRID">
        <app-icon><i-ph-folder /></app-icon> {{ $t('pathTreeLayouts.grid') }}
      </b-form-radio>
    </b-form-radio-group>
  </div>
</template>
