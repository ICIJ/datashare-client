<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

const props = defineProps({
  collapse: {
    type: Boolean
  }
})

const emit = defineEmits(['update:collapse'])

const { t } = useI18n()

const toggle = () => emit('update:collapse', !props.collapse)
const icon = computed(() => (props.collapse ? 'caret-down' : 'caret-up'))
</script>

<template>
  <button-icon
    class="form-step-heading-toggler border-secondary flex-shrink-0"
    square
    hide-tooltip
    hide-label
    :icon-left="icon"
    :label="t('formStepHeadingToggler.label')"
    variant="outline-secondary"
    @click="toggle"
  />
</template>

<style lang="scss" scoped>
.form-step-heading-toggler {
  --button-icon-square-size: 36px;
}
</style>
