<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppIcon } from '@icij/murmur-next'

import DisplayRole from '@/components/Display/DisplayRole.vue'
import { usePolicies } from '@/composables/usePolicies.js'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  noIcon: {
    type: Boolean,
    default: false
  }
})

const { getRolesByProject, formatRoles } = usePolicies()
const roles = computed(() => getRolesByProject(props.project.name))
const { t } = useI18n()
const rolesTitle = computed(() => t('displayRoles.yourRoles', { roles: formatRoles(roles.value) }, roles.value.length))

</script>

<template>
  <span
    v-if="roles"
    class="text-secondary-emphasis d-inline-flex align-items-center gap-1"
    :title="rolesTitle"
  >
    <app-icon v-if="!noIcon">
      <i-ph-user-square />
    </app-icon>
    <span
      v-for="(role,index) in roles"
      :key="index"
      class="d-inline-flex"
    >
      <display-role
        :value="role"
        no-icon
      /><span v-if="index !== roles.length-1">, </span>
    </span>
  </span>
</template>
