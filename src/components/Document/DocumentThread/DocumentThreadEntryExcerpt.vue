<script setup>
defineOptions({ name: 'DocumentThreadEntryExcerpt' })

defineProps({
  email: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <span class="document-thread-entry-excerpt text-secondary w-100">
    {{ email.excerpt }}
  </span>
</template>
