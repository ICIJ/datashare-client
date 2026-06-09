<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import IPhFloppyDiskBack from '~icons/ph/floppy-disk-back'

import FormCreation from '@/components/Form/FormCreation'
import TaskBatchSearchFormDetails from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails'
import { useCore } from '@/composables/useCore'
import { useToast } from '@/composables/useToast'
import { useTaskStore } from '@/store/modules/task'

const { indices, uuid } = defineProps({
  indices: {
    type: String,
    required: true
  },
  uuid: {
    type: String,
    required: true
  }
})

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()
const router = useRouter()
const taskStore = useTaskStore()

const name = ref('')
const description = ref('')
const visibility = ref(false)
const selectedProjects = ref([])

async function load() {
  const batchSearch = await core.api.getBatchSearch(uuid)
  name.value = batchSearch.name ?? ''
  description.value = batchSearch.description ?? ''
  visibility.value = !!batchSearch.published
  selectedProjects.value = (batchSearch.projects ?? []).map(project => ({ name: project }))
}

onMounted(load)

function reset() {
  load()
}

async function submit() {
  try {
    await taskStore.updateBatchSearch(uuid, visibility.value)
    await router.push({ name: 'task.batch-search-results.list', params: { indices, uuid } })
    toast.success(t('task.batch-search.form.editSuccess'))
  }
  catch {
    toast.error(t('task.batch-search.form.editError'))
  }
}
</script>

<template>
  <form-creation
    class="task-batch-search-form-edit d-flex flex-column gap-4"
    content-class-list="d-flex flex-column gap-3"
    :submit-label="t('global.save')"
    :submit-icon="IPhFloppyDiskBack"
    @reset="reset"
    @submit="submit"
  >
    <task-batch-search-form-details
      v-model:name="name"
      v-model:description="description"
      v-model:visibility="visibility"
      v-model:selected-projects="selectedProjects"
      disabled-name
      disabled-description
      hide-projects
      hide-visibility-hint
    />
  </form-creation>
</template>
