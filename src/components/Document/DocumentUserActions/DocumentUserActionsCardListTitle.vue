<template>
  <div class="py-2">
    <span class="bg-tertiary-subtle text-light-emphasis p-2 rounded">{{ title }}</span>
  </div>
</template>
<script setup>
defineOptions({ name: 'DocumentUserActionsCardListTitle' })
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>
