<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()

const users = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const { items } = await core.api.getProjectPolicies('default', props.name, { from: 0, to: 10 })
    users.value = (items ?? []).map(({ v0: name, v1: role }) => ({ name, role }))
  }
  catch {
    toast.error(t('projectViewEdit.users.fetchError'))
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="project-view-edit-users p-4">
    <project-users-list :users="users" />
  </div>
</template>
