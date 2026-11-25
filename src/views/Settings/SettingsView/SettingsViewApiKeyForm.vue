<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n'
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'

/**
 * A form to scope a new API key to some projects and an expiration.
 */
defineOptions({ name: 'SettingsViewApiKeyForm' })

const props = defineProps({
  /**
   * Projects the key can be scoped to.
   */
  projects: {
    type: Array,
    default: () => []
  },
  /**
   * Longest lifetime an admin allows, as an ISO-8601 duration (e.g. "P30D").
   */
  maxLifetime: {
    type: String,
    default: null
  },
  /**
   * Disable the submit button while the key is being created.
   */
  busy: {
    type: Boolean
  }
})

const emit = defineEmits(['submit'])

const PRESETS = [7, 30, 90]
const DEFAULT_PRESET = 30
const MAX = 'max'
const DAY_IN_MS = 86400000
// The backend rejects a date past its own now + cap, so a browser clock a few
// seconds ahead must not turn the preset matching the cap into a 400.
const CLOCK_SKEW_MARGIN_IN_MS = 60000

const { t } = useI18n()

const maxDays = computed(() => {
  const match = /^P(\d+)D$/.exec(props.maxLifetime ?? '')
  return match ? Number(match[1]) : Infinity
})

const options = computed(() => {
  const allowed = PRESETS.filter(days => days <= maxDays.value)
  const presets = allowed.map(days => ({ value: days, text: t('settings.api.form.expiresIn.days', { n: days }) }))
  if (presets.length) {
    return presets
  }
  const text = t('settings.api.form.expiresIn.max', { n: maxDays.value })
  return [{ value: MAX, text }]
})

function defaultExpiresIn() {
  const values = options.value.map(option => option.value)
  if (values.includes(DEFAULT_PRESET)) {
    return DEFAULT_PRESET
  }
  return values.at(-1)
}

const selectedProjects = ref([])
const expiresIn = ref(defaultExpiresIn())

function submit() {
  const projects = selectedProjects.value.map(project => project.name)
  if (expiresIn.value === MAX) {
    return emit('submit', { projects })
  }
  const lifetime = expiresIn.value * DAY_IN_MS
  const maxLifetime = maxDays.value * DAY_IN_MS - CLOCK_SKEW_MARGIN_IN_MS
  const safeLifetime = Math.min(lifetime, maxLifetime)
  const expiration = new Date(Date.now() + safeLifetime)
  const expirationDate = expiration.toISOString()
  emit('submit', { projects, expirationDate })
}
</script>

<template>
  <form
    class="settings-view-api-key-form"
    @submit.prevent="submit"
  >
    <form-fieldset-i18n
      name="projects"
      translation-key="settings.api.form.projects"
      force-compact
    >
      <project-dropdown-selector
        v-model="selectedProjects"
        :projects="projects"
      />
    </form-fieldset-i18n>
    <form-fieldset-i18n
      name="expires-in"
      translation-key="settings.api.form.expiresIn"
      class="settings-view-api-key-form__expires-in"
      force-compact
    >
      <b-form-radio-group
        v-model="expiresIn"
        :options="options"
        stacked
      />
    </form-fieldset-i18n>
    <div class="text-end">
      <b-button
        type="submit"
        variant="action"
        class="settings-view-api-key-form__submit"
        :disabled="busy"
      >
        {{ t('settings.api.form.submit') }}
      </b-button>
    </div>
  </form>
</template>
