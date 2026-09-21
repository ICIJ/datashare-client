<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import { usePolicies } from '@/composables/usePolicies.js'
import { ROLE_ICON, ROLE_COLOR, ROLE_ICON_DEFAULT } from '@/enums/roles.js'

const props = defineProps({
  value: {
    type: String
  },
  noIcon: {
    type: Boolean,
    default: false
  },
  iconSize: {
    type: String,
    default: null
  }
})

const { formatRole } = usePolicies()
const { t } = useI18n()
const role = computed(() => formatRole(t, props.value))
const icon = computed(() => ROLE_ICON[props.value] ?? ROLE_ICON_DEFAULT)
const iconStyle = computed(() => ({ color: ROLE_COLOR[props.value] ?? 'inherit' }))

defineExpose({ icon, iconStyle })
</script>

<template>
  <span class="display-role d-inline-flex gap-1">
    <app-icon
      v-if="!noIcon"
      :name="icon"
      :size="iconSize"
      :style="iconStyle"
    />
    {{ role }}
  </span>
</template>
