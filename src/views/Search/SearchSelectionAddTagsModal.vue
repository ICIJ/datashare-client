<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import flatten from 'lodash/flatten'
import map from 'lodash/map'
import uniq from 'lodash/uniq'
import { useI18n } from 'vue-i18n'
import { ImageModeSource } from '@icij/murmur'

import imageLight from '@/assets/images/illustrations/app-modal-tag-add-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-tag-add-dark.svg'
import AppModalPrompt from '@/components/AppModal/AppModalPrompt'
import FormControlTag from '@/components/Form/FormControl/FormControlTag/FormControlTag'
import { useElasticSearchQuery } from '@/composables/useElasticSearchQuery'

const props = defineProps({
  indices: { type: Array, default: () => [] },
  nbDocs: { type: Number }
})

const emit = defineEmits(['submit'])

const { t } = useI18n()

const tags = ref([])
const allTags = ref([])

const submit = () => {
  emit('submit', {
    trigger: 'submit',
    tags: tags.value
  })
}

const { fetchAllTagsByIndex } = useElasticSearchQuery()

const hasTags = computed(() => tags.value.length > 0)

// The suggestion dropdown matches plain strings, so the aggregated tags are
// reduced to their labels. The same tag can exist in several indices, hence the
// deduplication.
async function fetchAllTags() {
  const results = await Promise.all(map(props.indices, index => fetchAllTagsByIndex(index)))
  allTags.value = uniq(map(flatten(results), 'label'))
}

// Enter on a non-empty input adds the tag being typed, and Enter on a focused
// suggestion picks it, so it only confirms the modal when it is pressed on the
// empty text field with at least one tag added.
const submitOnEnter = ({ target }, ok) => {
  const isEmptyTextField = target.tagName === 'INPUT' && target.value === ''
  if (isEmptyTextField && hasTags.value) {
    ok()
  }
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
      <image-mode-source
        :src="imageDark"
        color-mode="dark"
      />
    </template>
    <template #default="{ ok, visible }">
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
          @keydown.enter="submitOnEnter($event, ok)"
        />
        {{ t('searchSelectionAddTagsModal.description') }}
        <p
          v-if="hasTags"
          class="mt-2"
        >
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
