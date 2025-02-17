<template>
  <b-form class="d-flex flex-column gap-1">
    <b-form-group
      v-for="(_, name) in settings"
      :key="name"
      :label-cols="12"
      :label-cols-sm="4"
      :label-cols-lg="3"
      :label-for="`input-settings-${name}`"
    >
      <template #label>
        <settings-general-label :name="name" :field-changed="fieldChanged(name)" @restore="restore" />
      </template>
      <b-form-input :id="`input-settings-${name}`" v-model="replica[name]" />
    </b-form-group>
    <div class="d-flex gap-3 justify-content-end">
      <b-button type="reset" variant="outline-tertiary" :disabled="hasNotChanged" @click="reset">
        {{ resetLabel }}
      </b-button>
      <b-button type="submit" variant="action" :disabled="hasNotChanged">
        {{ submitLabel }}
      </b-button>
    </div>
  </b-form>
</template>
<script setup>
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { isEqual } from 'lodash'

import SettingsGeneralLabel from '@/components/Settings/SettingsGeneral/SettingsGeneralLabel'
const props = defineProps({
  settings: {
    type: Object,
    default: () => {}
  }
})

const replica = reactive({ ...props.settings })
const { t } = useI18n()
const submitLabel = computed(() => t('global.submit'))
const resetLabel = computed(() => t('global.reset'))
function fieldChanged(field) {
  return props.settings[field] !== replica[field]
}

function restore(field) {
  replica[field] = props.settings[field]
}
function reset() {
  Object.assign(replica, props.settings)
}
const hasNotChanged = computed(() => {
  return isEqual(props.settings, replica)
})
</script>
