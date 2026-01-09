<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'
import IPhTreeStructure from '~icons/ph/tree-structure'

import ButtonTogglePathTreeView from '@/components/Button/ButtonTogglePathTreeView'
import { LAYOUTS, layoutValidator } from '@/enums/pathTree'

const layout = defineModel('layout', { type: String, default: LAYOUTS.TREE, validator: layoutValidator })

defineProps({
  /**
   * Optional label to display above the tree
   */
  label: {
    type: String
  },
  /**
   * Optional icon to display next to the label (string name or icon object)
   */
  icon: {
    type: [String, Object, Array],
    default: () => IPhTreeStructure
  }
})

const nested = computed({
  get: () => layout.value === LAYOUTS.TREE,
  set: (value) => {
    layout.value = value ? LAYOUTS.TREE : LAYOUTS.LIST
  }
})

const { t } = useI18n()
</script>

<template>
  <div class="path-tree-view-label d-flex gap-2 align-items-center">
    <app-icon
      v-if="icon"
      :name="icon"
    />
    <div class="text-truncate flex-grow-1">
      {{ label ?? t('pathViewLabel.label') }}
    </div>
    <button-toggle-path-tree-view v-model:active="nested" />
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-label {
  font-size: 1.25rem;
  font-weight: 700;
}
</style>
