<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import bodybuilder from 'bodybuilder'
import { flatten, get, map } from 'lodash'
import { useI18n } from 'vue-i18n'
import { ImageModeSource } from '@icij/murmur-next'

import imageLight from '@/assets/images/illustrations/app-modal-tag-add-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-tag-add-dark.svg'
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

const closeAllowed = ref(true)

const preventFn = (e) => {
  if (!closeAllowed.value) {
    closeAllowed.value = true
    e.preventDefault()
  }
}

onBeforeMount(fetchAllTags)
</script>

<template>
  <app-modal-prompt
    class="search-selection-add-tags-modal"
    :autofocus="false"
    :image="imageLight"
    :title="t('searchSelectionAddTagsModal.title', nbDocs)"
    :ok-disabled="!hasTags"
    :ok-title="t('searchSelectionAddTagsModal.okTitle')"
    @esc="preventFn"
    @submit="submit"
  >
    <template #header-image-source>
      <image-mode-source :src="imageDark" color-mode="dark" />
    </template>
    <template #default="{ visible }">
      <div class="d-flex flex-column gap-3">
        <form-control-tag
          v-if="visible"
          ref="formControlTagRef"
          v-model="tags"
          autofocus
          :placeholder="t('searchSelectionAddTagsModal.placeholder')"
          :options="allTags"
          class="document-user-tags-ac tions w-100"
          no-duplicates
          no-clear
          @focus="closeAllowed = false"
          @blur="closeAllowed = false"
        />
        {{ t('searchSelectionAddTagsModal.description') }}
        <p v-if="hasTags" class="mt-2">
          {{ t('searchSelectionAddTagsModal.question', tags.length) }}
        </p>
      </div>
    </template>
  </app-modal-prompt>
</template>

<style lang="scss">
.search-selection-add-tags-modal {
  & .modal-body {
    z-index: 1;
  }
}
</style>
