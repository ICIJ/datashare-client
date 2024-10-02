<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const pinned = defineModel('pinned', {
  type: Boolean,
  default: false
})

const weight = computed(() => {
  return pinned.value ? 'fill' : 'regular'
})

const label = computed(() => {
  return t(pinned.value ? 'projectJumbotronPin.unpin' : 'projectJumbotronPin.pin')
})

const togglePin = () => {
  pinned.value = !pinned.value
}
</script>

<template>
  <button-icon
    icon-left="push-pin"
    :icon-left-weight="weight"
    class="px-0 py-2"
    variant="link"
    :label="label"
    @click="togglePin"
  />
</template>
