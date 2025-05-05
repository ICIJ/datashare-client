<script setup>
import { useI18n } from 'vue-i18n'

import FormStep from '@/components/Form/FormStep/FormStep'
import TabGroupEntry from '@/components/TabGroup/TabGroupEntry'
import TabGroup from '@/components/TabGroup/TabGroup'
const csvFile = defineModel('csvFile', { type: File })

const { t } = useI18n()
</script>

<template>
  <form-step :title="t('task.batch-search.form.sections.queries')" :index="2">
    <tab-group>
      <tab-group-entry :title="t('task.batch-search.form.csvFile.label')">
        <b-form-file
          v-model="csvFile"
          :placeholder="t('task.batch-search.form.csvFile.placeholder')"
          :state="!!csvFile"
          accept=".csv"
          class="text-truncate"
          name="csvFile"
          no-drop
          required
        />
        <div class="bg-tertiary-subtle rounded-2 mt-3 p-3">
          <ul class="m-0">
            <li>Only CSV format is accepted.</li>
            <li>Export your spreadsheet as a CSV using encoding UTF-8</li>
            <li>Your CSV file should not contain more than 60,000 queries</li>
            <li>The first and only column should contain the terms to search</li>
            <li>No line break(s) in cells</li>
            <li>
              Selecting 'do phrase matches' prevent from using operators like <code>AND</code>, <code>OR</code>,
              <code>NOT</code>, <code>*</code>, <code>?</code>, <code>!</code>, <code>+</code>, <code>-</code> or
              Regexes between 2 slashes.
            </li>
          </ul>
        </div>
      </tab-group-entry>
      <tab-group-entry :title="t('task.batch-search.form.listQueries.label')">
        <div class="text-secondary text-center p-3">
          {{ t('task.batch-search.form.listQueries.placeholder') }}
        </div>
      </tab-group-entry>
    </tab-group>
  </form-step>
</template>
