<script setup>
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/AppModal/AppModal.vue'
import DisplayRole from '@/components/Display/DisplayRole.vue'
import DisplayUser from '@/components/Display/DisplayUser.vue'

defineProps({
  promotions: {
    type: Array,
    required: true
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
    :title="t('projectViewEdit.users.adminPromotionModal.title')"
    :ok-title="t('projectViewEdit.users.adminPromotionModal.confirm')"
    :cancel-title="t('projectViewEdit.users.adminPromotionModal.cancel')"
    ok-variant="action"
    @ok="onConfirm"
  >
    <p class="mb-3">
      {{ t('projectViewEdit.users.adminPromotionModal.body') }}
    </p>
    <ul class="list-unstyled d-flex flex-column gap-2">
      <li
        v-for="promotion in promotions"
        :key="promotion.login"
        class="d-flex align-items-center gap-2"
      >
        <display-user :value="promotion.login" />
        <display-role :value="promotion.newRole" />
      </li>
    </ul>
  </app-modal>
</template>
