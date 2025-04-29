<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'DocumentUserCommentsListNewest' })
</script>

<template>
  <button-icon :label="$t('documentUserCommentsListNewest.label')" :icon-left="PhCaretDown" variant="link" />
</template>
