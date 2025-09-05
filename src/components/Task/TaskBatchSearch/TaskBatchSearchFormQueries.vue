<script setup>
import { useI18n } from 'vue-i18n'

import { BATCH_SEARCH_CSV_FILE, BATCH_SEARCH_CSV_STRING } from '@/enums/batchSearch'
import FormStep from '@/components/Form/FormStep/FormStep'
import TabGroupEntry from '@/components/TabGroup/TabGroupEntry'
import TabGroup from '@/components/TabGroup/TabGroup'

const csvFile = defineModel('csvFile', { type: File })
const csvString = defineModel('csvString', { type: String })
const csvTab = defineModel('csvTab', { type: String, default: BATCH_SEARCH_CSV_FILE })
const { t } = useI18n()
</script>

<template>
  <form-step
    :title="t('task.batch-search.form.sections.queries')"
    :index="2"
  >
    <tab-group
      v-model="csvTab"
      lazy
    >
      <tab-group-entry
        :id="BATCH_SEARCH_CSV_FILE"
        :title="t('task.batch-search.form.csvFile.label')"
      >
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
            <li v-html="t('task.batch-search.form.queries.onlyCSV')" />
            <li v-html="t('task.batch-search.form.queries.onlyUTF8')" />
            <li v-html="t('task.batch-search.form.queries.queriesLimist')" />
            <li v-html="t('task.batch-search.form.queries.firstColumn')" />
            <li v-html="t('task.batch-search.form.queries.lineBreaks')" />
            <li v-html="t('task.batch-search.form.queries.operators')" />
          </ul>
        </div>
      </tab-group-entry>
      <tab-group-entry
        :id="BATCH_SEARCH_CSV_STRING"
        :title="t('task.batch-search.form.csvString.label')"
      >
        <b-form-textarea
          v-model="csvString"
          class="form-control"
          :rows="7"
          :placeholder="t('task.batch-search.form.csvString.placeholder')"
          required
        />
      </tab-group-entry>
    </tab-group>
  </form-step>
</template>
