<script setup>
import { LAYOUTS, layoutValidator } from '@/enums/pathTree'
import { PhosphorIcon } from '@icij/murmur-next'

const modelValue = defineModel('modelValue', {
  type: String,
  default: LAYOUTS.TREE,
  validator: layoutValidator
})
</script>

<template>
  <div>
    <b-form-radio-group
      v-model="modelValue"
      name="path-tree-layouts"
    >
      <b-form-radio :value="LAYOUTS.TREE">
        <phosphor-icon name="tree-view" /> {{ $t('pathTreeLayouts.tree') }}
      </b-form-radio>
      <b-form-radio :value="LAYOUTS.LIST">
        <phosphor-icon name="list-bullets" /> {{ $t('pathTreeLayouts.list') }}
      </b-form-radio>
      <b-form-radio :value="LAYOUTS.GRID">
        <phosphor-icon name="folder" /> {{ $t('pathTreeLayouts.grid') }}
      </b-form-radio>
    </b-form-radio-group>
  </div>
</template>
