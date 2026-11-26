<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur'

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
// The subset of ISO-8601 durations the backend parses (java.time.Duration): days, hours,
// minutes and seconds.
const DURATION_PATTERN = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:[.,]\d+)?)S)?)?$/i

const { t } = useI18n()

function parseDurationInMs(duration) {
  const match = DURATION_PATTERN.exec(duration)
  if (!match) {
    return null
  }
  const [, days = 0, hours = 0, minutes = 0, seconds = '0'] = match
  const totalHours = Number(days) * 24 + Number(hours)
  const totalMinutes = totalHours * 60 + Number(minutes)
  const totalSeconds = totalMinutes * 60 + Number(seconds.replace(',', '.'))
  const durationInMs = totalSeconds * 1000
  return durationInMs > 0 ? durationInMs : null
}

// Infinity without a cap, null for a cap the client cannot read.
const maxLifetimeInMs = computed(() => {
  if (!props.maxLifetime) {
    return Infinity
  }
  return parseDurationInMs(props.maxLifetime)
})

function presetOption(days) {
  const text = t('settings.api.form.expiresIn.days', { n: days })
  return { value: days, text }
}

function maxOption() {
  const days = maxLifetimeInMs.value / DAY_IN_MS
  if (Number.isInteger(days) && days > 0) {
    const text = t('settings.api.form.expiresIn.max', { n: days })
    return { value: MAX, text }
  }
  const text = t('settings.api.form.expiresIn.maxAllowed')
  return { value: MAX, text }
}

const options = computed(() => {
  if (maxLifetimeInMs.value === null) {
    return [maxOption()]
  }
  const allowed = PRESETS.filter(days => days * DAY_IN_MS <= maxLifetimeInMs.value)
  const presets = allowed.map(presetOption)
  if (presets.length) {
    return presets
  }
  return [maxOption()]
})

function defaultExpiresIn() {
  const values = options.value.map(option => option.value)
  if (values.includes(DEFAULT_PRESET)) {
    return DEFAULT_PRESET
  }
  return values.at(-1)
}

// The projects menu is teleported into the modal rather than <body>, where it would open
// under the modal.
const form = useTemplateRef('form')
const projectsTeleportTo = computed(() => form.value?.closest('.modal') ?? 'body')

const selectedProjects = ref([])
const expiresIn = ref(defaultExpiresIn())

function submit() {
  const projects = selectedProjects.value.map(project => project.name)
  if (expiresIn.value === MAX) {
    return emit('submit', { projects })
  }
  const lifetime = expiresIn.value * DAY_IN_MS
  const maxLifetime = maxLifetimeInMs.value - CLOCK_SKEW_MARGIN_IN_MS
  const safeLifetime = Math.min(lifetime, maxLifetime)
  const expiration = new Date(Date.now() + safeLifetime)
  const expirationDate = expiration.toISOString()
  emit('submit', { projects, expirationDate })
}
</script>

<template>
  <form
    ref="form"
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
        :teleport-to="projectsTeleportTo"
        :placeholder="t('settings.api.key.allProjects')"
        empty-means-all
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
      <button-icon
        type="submit"
        variant="action"
        class="settings-view-api-key-form__submit"
        :disabled="busy"
        :loading="busy"
      >
        {{ t('settings.api.newApiKey') }}
      </button-icon>
    </div>
  </form>
</template>
