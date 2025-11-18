<script setup>
import { computed, watchEffect, ref } from 'vue'
import { isFunction, isString } from 'lodash'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useCore } from '@/composables/useCore'

const props = defineProps({
  value: {
    type: [String, Object],
    required: true
  },
  title: {
    type: String
  }
})

const { t } = useI18n()
const core = useCore()
const router = useRouter()

const route = computed(() => {
  try {
    if (typeof props.value === 'object') {
      return router.resolve(props.value)
    }
    return router.resolve({ name: props.value })
  }
  catch {
    return null
  }
})

const display = ref(null)

function applyDisplay() {
  // Always reset the display value so we can have an incremental population
  // of the display value based on the available data. This is why every condition
  // checks if `display.value` is still null before setting it.
  display.value = null
  // Use the provided title from props
  if (props.title) {
    display.value = props.title
  }
  // Or use the title from the route meta as a function
  if (!display.value && isFunction(route.value?.meta?.title)) {
    display.value = route.value.meta.title(core)
  }
  // Or use the title from the route meta as a translation key
  if (!display.value && isString(route.value?.meta?.title)) {
    display.value = t(route.value.meta.title)
  }
}

watchEffect(applyDisplay)
</script>

<template>
  <span class="display-route">
    {{ display }}
  </span>
</template>
