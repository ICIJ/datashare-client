<script setup>
import { useI18n } from 'vue-i18n'
import { computed, reactive, onBeforeMount, useId } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { useModal } from 'bootstrap-vue-next'

import { apiInstance as api } from '@/api/apiInstance'
import { useLanguagesStore } from '@/store/modules/languages'
import AppModal from '@/components/AppModal/AppModal'
import DocumentDropdownReindexModalParent from '@/components/Document/DocumentDropdown/DocumentDropdownReindexModalParent.vue'
import FormControlExtractingLanguage from '@/components/Form/FormControl/FormControlExtractingLanguage'
import FormControlOcr from '@/components/Form/FormControl/FormControlOcr.vue'
import TaskDocumentsFormOcrAlert from '@/components/Task/TaskDocuments/TaskDocumentsFormOcrAlert'

const modelValue = defineModel({ type: Boolean, default: false })

const { document } = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const languagesStore = useLanguagesStore()
const modalId = useId()
const { hide } = useModal(modalId)

const form = reactive({
  defaultProject: computed(() => document.project),
  ocr: false,
  language: null
})

const size = computed(() => (document.parent ? 'lg' : 'md'))

function submit() {
  return api.indexPath(document.path, { ...form, filter: false })
}

onBeforeMount(languagesStore.fetchOnce)
onBeforeRouteUpdate(() => hide())
</script>

<template>
  <app-modal
    :id="modalId"
    v-model="modelValue"
    :size="size"
    :title="t('documentDropdownReindexModal.title')"
    :ok-title="t('documentDropdownReindexModal.okTitle')"
    @ok="submit"
  >
    <div class="d-flex flex-column gap-3">
      <document-dropdown-reindex-modal-parent :document="document" />

      <b-form-group :label="t('documentDropdownReindexModal.formLanguage')">
        <form-control-extracting-language v-model="form.language" />
      </b-form-group>

      <b-form-group :label="t('documentDropdownReindexModal.formOcr')">
        <form-control-ocr
          v-model="form.ocr"
          :disabled="languagesStore.missingOcrLanguages"
        />
      </b-form-group>

      <task-documents-form-ocr-alert
        :disabled="!form.ocr"
        :language="form.language"
      />
    </div>
  </app-modal>
</template>
