<script setup>
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/AppModal/AppModal.vue'
import InstanceUsersRoleBadge from '@/components/InstanceUsers/InstanceUsersRoleBadge.vue'

// Mirrors the roles modal's own convention: '*' is casbin's wildcard project, used for both
// instance and domain admin grants (see SettingsViewUsersRolesModal.vue).
const INSTANCE_SCOPE = '*'

defineProps({
  // The grants { role, domain, project } that will be revoked if the user confirms.
  grants: {
    type: Array,
    required: true
  },
  // Under OAuth, project membership is reconciled from the identity provider at each login, so a
  // project grant revoked here can come back regardless of whether this wide role is ever
  // revoked later (see SettingsViewUsersRolesModal.vue's own comment on isAuthWithUsersProvider).
  // Only the datashare-native case can honestly promise these grants stay gone.
  revokedGrantsStayRevoked: {
    type: Boolean,
    default: true
  }
})

const modelValue = defineModel({ type: Boolean })
const emit = defineEmits(['confirm'])

const { t } = useI18n()

function onConfirm() {
  emit('confirm')
  modelValue.value = false
}
</script>

<template>
  <app-modal
    v-model="modelValue"
    :title="t('settings.users.rolesModal.cascadeModal.title')"
    :ok-title="t('settings.users.rolesModal.cascadeModal.confirm')"
    :cancel-title="t('settings.users.rolesModal.cascadeModal.cancel')"
    ok-variant="action"
    @ok="onConfirm"
  >
    <p class="mb-3">
      {{ t(revokedGrantsStayRevoked ? 'settings.users.rolesModal.cascadeModal.body' : 'settings.users.rolesModal.cascadeModal.bodyMayReturn') }}
    </p>
    <ul class="list-unstyled d-flex flex-column gap-2">
      <li
        v-for="grant in grants"
        :key="`${grant.domain}::${grant.project}::${grant.role}`"
      >
        <instance-users-role-badge
          :role="grant.role"
          :project="grant.project === INSTANCE_SCOPE ? null : grant.project"
        />
      </li>
    </ul>
  </app-modal>
</template>
