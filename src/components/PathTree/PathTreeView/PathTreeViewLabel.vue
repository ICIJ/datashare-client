<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import ButtonTogglePathTreeView from '@/components/Button/ButtonTogglePathTreeView'
import { LAYOUTS, layoutValidator } from '@/enums/pathTree'

const layout = defineModel('layout', { type: String, default: LAYOUTS.TREE, validator: layoutValidator })

defineProps({
  label: {
    type: String
  },
  icon: {
    type: [String, Object, Array],
    default: PhTreeStructure
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
    <phosphor-icon
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
