<script setup>
import { computed } from 'vue'
import { capitalize, isFunction, isString } from 'lodash'
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
const { core } = useCore()
const router = useRouter()

const route = computed(() => {
  try {
    if (typeof props.value === 'object') {
      return router.resolve(props.value)
    }
    return router.resolve({ name: props.value })
  } catch {
    return null
  }
})

const display = computed(() => {
  return (
    // Use the provided title from props
    props.title ||
    // Or use the title from the route meta as a function
    (isFunction(route.value?.meta?.title) && route.value.meta.title({ route: route.value, core })) ||
    // Or use the title from the route meta as a translation key
    (isString(route.value?.meta?.title) && t(route.value.meta.title)) ||
    // Or use the last part of the route name
    capitalize(route.value?.name.split('.').pop())
  )
})
</script>

<template>
  <span class="display-route">
    {{ display }}
  </span>
</template>
