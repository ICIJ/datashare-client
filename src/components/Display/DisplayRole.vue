<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur'
import { useI18n } from 'vue-i18n'

import { usePolicies } from '@/composables/usePolicies.js'
import { roleColor, roleIcon } from '@/enums/roles.js'

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
const icon = computed(() => roleIcon(props.value))
const iconStyle = computed(() => ({ color: roleColor(props.value) }))

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
