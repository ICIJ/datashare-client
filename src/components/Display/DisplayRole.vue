<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur-next'

import { usePolicies } from '@/composables/usePolicies.js'
import { ROLE_KEY } from '@/enums/roles.js'
import { useI18n } from 'vue-i18n'

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
const role = computed(() => formatRole(t,props.value))
</script>

<template>
  <span class="display-role d-inline-flex gap-1">
    <app-icon
      v-if="!noIcon"
      :size="iconSize"
    >
      <i-ph-user-square />
    </app-icon>
    {{ role }}
  </span>
</template>
