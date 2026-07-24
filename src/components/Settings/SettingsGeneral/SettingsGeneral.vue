<script setup>
import { computed, toRaw, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { isEqual } from 'lodash'

import SettingsGeneralLabel from '@/components/Settings/SettingsGeneral/SettingsGeneralLabel'
import ButtonReset from '@/components/Button/ButtonReset'

const OBFUSCATED_VALUE = '******'

const props = defineProps({
  settings: {
    type: Object,
    default: () => {}
  }
})

const replica = reactive({ ...props.settings })
const { t } = useI18n()

const submitLabel = computed(() => t('global.submit'))
const hasNotChanged = computed(() => isEqual(props.settings, replica))

const emit = defineEmits(['save'])

function isObfuscated(field) {
  return String(props.settings[field]).includes(OBFUSCATED_VALUE)
}

function fieldChanged(field) {
  return props.settings[field] !== replica[field]
}

function restore(field) {
  replica[field] = props.settings[field]
}

function reset() {
  Object.assign(replica, props.settings)
}

function save() {
  const raw = toRaw(replica)
  const filtered = Object.fromEntries(Object.entries(raw).filter(([key]) => !isObfuscated(key)))
  emit('save', filtered)
}
</script>

<template>
  <b-form
    class="d-flex flex-column gap-1"
    @submit.prevent="save"
  >
    <b-form-group
      v-for="(_, name) in settings"
      :key="name"
      :label-cols="12"
      :label-cols-sm="4"
      :label-cols-lg="3"
      :label-for="`input-settings-${name}`"
    >
      <template #label>
        <settings-general-label
          :name="name"
          :field-changed="fieldChanged(name)"
          @restore="restore"
        />
      </template>
      <b-form-input
        :id="`input-settings-${name}`"
        v-model="replica[name]"
        :disabled="isObfuscated(name)"
      />
    </b-form-group>
    <div class="d-flex gap-3 justify-content-end">
      <button-reset
        type="reset"
        :disabled="hasNotChanged"
        @click="reset"
      />
      <b-button
        type="submit"
        variant="action"
        :disabled="hasNotChanged"
      >
        {{ submitLabel }}
      </b-button>
    </div>
  </b-form>
</template>
