<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
defineOptions({ name: 'ButtonAdd' })
defineProps({
  label: {
    type: String
  }
})
const { t } = useI18n()
</script>

<template>
  <button-icon
    :label="label ?? t('buttonAdd.label')"
    class="button-add"
    hide-label
    :icon-left="PhPlus"
    pill
    square
    variant="action"
  />
</template>
