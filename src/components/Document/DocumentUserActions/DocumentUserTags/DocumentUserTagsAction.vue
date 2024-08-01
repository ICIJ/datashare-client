<script setup>
const modelValue = defineModel({ type: String, required: true })
const placeholder = 'Add tags like "wapo_lemonade, bananas"'
</script>

<template>
  <b-form-input v-model="modelValue" class="document-user-tags-action" :placeholder="placeholder" />
</template>
<style lang="scss" scoped>
.document-user-tags-action {
  min-width: 300px;
  max-width: 400px;
}
</style>
