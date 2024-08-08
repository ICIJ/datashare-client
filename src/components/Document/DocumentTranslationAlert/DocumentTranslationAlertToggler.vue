<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  active: {
    type: Boolean
  }
})

const { t } = useI18n()

const label = computed(() => {
  const message = props.active ? 'viewOriginal' : 'viewTranslation'
  return t(`documentTranslationAlertToggler.${message}`)
})
</script>

<template>
  <button-icon
    class="document-translation-alert-toggler"
    variant="outline-warning"
    :label="label"
    @click="$emit('update:active', !active)"
  />
</template>

<style lang="scss" scoped>
.document-translation-alert-toggler {
  --bs-btn-bg: var(--bs-body-bg);
}
</style>
