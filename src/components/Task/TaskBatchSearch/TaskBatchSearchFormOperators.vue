<script setup>
import { useI18n } from 'vue-i18n'

import FormControlRange from '@/components/Form/FormControl/FormControlRange/FormControlRange'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n'
import FormStep from '@/components/Form/FormStep/FormStep'

const phraseMatch = defineModel('phraseMatch', { type: Boolean, default: false })
const phraseChanges = defineModel('phraseChanges', { type: Number, default: 0 })
const spellingChanges = defineModel('spellingChanges', { type: Number, default: 0 })

const { t } = useI18n()
</script>

<template>
  <form-step
    :title="t('task.batch-search.form.sections.operators')"
    :index="3"
    collapse
  >
    <form-fieldset-i18n
      name="phraseMatch"
      translation-key="task.batch-search.form.phraseMatch"
      :icon="PhQuotes"
      label-class="pt-md-0"
    >
      <b-form-radio-group
        v-model="phraseMatch"
        stacked
      >
        <b-form-radio
          name="phraseMatch"
          :value="false"
        >
          {{ t('task.batch-search.form.phraseMatch.options.no') }}
        </b-form-radio>
        <b-form-radio
          name="phraseMatch"
          :value="true"
        >
          {{ t('task.batch-search.form.phraseMatch.options.yes') }}
        </b-form-radio>
      </b-form-radio-group>
    </form-fieldset-i18n>
    <form-fieldset-i18n
      v-if="phraseMatch"
      name="phraseChanges"
      translation-key="task.batch-search.form.phraseChanges"
      label-class="pt-md-0"
      force-compact
      :icon="PhTextAa"
    >
      <form-control-range
        v-model="phraseChanges"
        name="phraseChanges"
        :min="0"
        :max="3"
        :step="1"
      />
    </form-fieldset-i18n>
    <form-fieldset-i18n
      v-else
      name="spellingChanges"
      translation-key="task.batch-search.form.spellingChanges"
      label-class="pt-md-0"
      force-compact
      :icon="PhTextAa"
    >
      <form-control-range
        v-model="spellingChanges"
        name="spellingChanges"
        :min="0"
        :max="5"
        :step="1"
      />
    </form-fieldset-i18n>
  </form-step>
</template>
