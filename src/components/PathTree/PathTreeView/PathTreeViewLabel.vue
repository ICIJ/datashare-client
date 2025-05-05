<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

defineProps({
  label: {
    type: String
  },
  icon: {
    type: [String, Object, Array],
    default: PhTreeStructure
  }
})

const { t } = useI18n()
</script>

<template>
  <div class="path-tree-view-label d-flex gap-2 align-items-center">
    <phosphor-icon v-if="icon" :name="icon" />
    <div class="text-truncate">
      {{ label ?? t('pathViewLabel.label') }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-label {
  font-size: 1.25rem;
  font-weight: 700;
}
</style>
