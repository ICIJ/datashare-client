<script setup>
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'DocumentUserTagsAction' })

const modelValue = defineModel({ type: String, required: true })

const { t } = useI18n()
const placeholder = t('documentUserTagsAction.placeholder')
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
