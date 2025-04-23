<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'DocumentUserCommentsListOldest' })
</script>

<template>
  <button-icon :label="$t('documentUserCommentsListOldest.label')" :icon-left="PhCaretUp" variant="link" />
</template>
