<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import bodybuilder from 'bodybuilder'
import { flatten, get, map } from 'lodash'
import { useI18n } from 'vue-i18n'

import AppModalPrompt from '@/components/AppModal/AppModalPrompt'
import FormControlTag from '@/components/Form/FormControl/FormControlTag/FormControlTag'
import { useCore } from '@/composables/useCore'
const props = defineProps({
  indices: { type: Array, default: () => [] },
  nbDocs: { type: Number }
})
const emit = defineEmits(['submit'])
const { core } = useCore()
const { t } = useI18n()
const tags = ref([])
const allTags = ref([])

const submit = () => {
  emit('submit', {
    trigger: 'submit',
    tags: tags.value
  })
}
const fetchAllTagsByIndex = async (index) => {
  const body = bodybuilder().size(0).agg('terms', 'tags').build()
  const response = await core.api.elasticsearch.search({ index, body })
  const buckets = get(response, 'aggregations.agg_terms_tags.buckets', [])
  return buckets.map(({ key: label }) => label)
}
const hasTags = computed(() => tags.value.length > 0)

async function fetchAllTags() {
  const results = await Promise.all(map(props.indices, (index) => fetchAllTagsByIndex(index)))
  allTags.value = flatten(results)
}
onBeforeMount(fetchAllTags)
</script>

<template>
  <app-modal-prompt :title="t('searchSelectionAddTagsModal.title', nbDocs)" :ok-disabled="!hasTags" @submit="submit">
    <div class="d-flex flex-column gap-3">
      <form-control-tag v-model="tags" :options="allTags" class="document-user-tags-actions w-100" no-duplicate />
      <p v-if="hasTags" class="mt-2">
        {{ t('searchSelectionAddTagsModal.description', tags.length) }}
      </p>
    </div>
  </app-modal-prompt>
</template>
