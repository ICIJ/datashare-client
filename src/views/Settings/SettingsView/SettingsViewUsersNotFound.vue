<script setup>
defineProps({
  uid: {
    type: String,
    required: true
  }
})
</script>

<template>
  <i18n-t
    keypath="settings.users.notFound"
    tag="p"
    class="settings-view-users-not-found mb-0"
  >
    <template #uid>
      <strong>{{ uid }}</strong>
    </template>
  </i18n-t>
</template>
