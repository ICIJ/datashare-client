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
            <li v-html="t('task.batch-search.form.queries.onlyCSV')" />
            <li v-html="t('task.batch-search.form.queries.onlyUTF8')" />
            <li v-html="t('task.batch-search.form.queries.queriesLimist')" />
            <li v-html="t('task.batch-search.form.queries.firstColumn')" />
            <li v-html="t('task.batch-search.form.queries.lineBreaks')" />
            <li v-html="t('task.batch-search.form.queries.operators')" />
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
