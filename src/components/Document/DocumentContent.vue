<script setup>
import { toRef, ref, reactive, computed, watch, onMounted, nextTick, useTemplateRef } from 'vue'
import { useStore } from 'vuex'
import { clamp, findLastIndex, entries, isEmpty, get, range, throttle } from 'lodash'

import { addLocalSearchMarksClassByOffsets } from '@/utils/strings'
import { useWait } from '@/composables/wait'
import DocumentAttachments from '@/components/Document/DocumentAttachments'
import DocumentGlobalSearchTerms from '@/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTerms'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import Hook from '@/components/Hook'

const props = defineProps({
  document: Object,
  targetLanguage: {
    type: String,
    default: null
  },
  q: {
    type: String,
    default: ''
  },
  pageSize: {
    type: Number,
    default: 1e4
  }
})

const store = useStore()
const elementRef = useTemplateRef('element')
const { waitFor } = useWait()

const contentSlices = reactive({})
const currentContentPage = ref('')
const activeContentSliceOffset = ref(0)
const localSearchIndex = ref(0)
const localSearchIndexes = ref([])
const localSearchOccurrences = ref(0)
const localSearchTerm = ref(props.q)
const rightToLeftLanguages = ['ARABIC', 'HEBREW', 'PERSIAN']
const maxOffsetTranslations = ref({})

const globalSearchTerms = computed(() => store.getters['search/retrieveContentQueryTerms'])

function getPipelineChain(category, ...pipelines) {
  return store.getters['pipelines/applyPipelineChainByCategory'](category, ...pipelines)
}

function addLocalSearchMarks(content, { offset: delta = 0 } = {}) {
  if (!hasLocalSearchTerms.value) {
    return content
  }
  const offsets = localSearchIndexes.value
  const term = localSearchTerm.value
  return addLocalSearchMarksClassByOffsets({ content, term, offsets, delta })
}

const contentPipeline = computed(() => {
  return getPipelineChain('extracted-text', addLocalSearchMarks)
})

const contentPipelineParams = computed(() => ({
  globalSearchTerms: globalSearchTerms.value,
  localSearchIndex: localSearchIndex.value,
  localSearchOccurrences: localSearchOccurrences.value,
  localSearchTerm: localSearchTerm.value
}))

const activeTermOffset = computed(() => {
  return localSearchIndexes.value[localSearchIndex.value - 1]
})

const showPagination = computed(() => nbPages.value > 1 && loadedOnce.value)

const hasLocalSearchTerms = computed(() => {
  return localSearchTerm.value && localSearchTerm.value.length > 0
})

const isRightToLeft = computed(() => {
  const language = get(props.document, 'source.language', null)
  return rightToLeftLanguages.includes(language)
})

const classList = computed(() => {
  return {
    'document-content--paginated': showPagination.value,
    'document-content--rtl': isRightToLeft.value
  }
})

const page = computed({
  get() {
    return Math.floor(activeContentSliceOffset.value / props.pageSize) + 1
  },
  set(value) {
    scrollUp()
    activeContentSliceOffset.value = (value - 1) * props.pageSize
  }
})

const hasExtractedContent = computed(() => maxOffset.value > 0)

const maxOffset = computed(() => {
  const key = props.targetLanguage ?? 'original'
  return maxOffsetTranslations.value[key] || 0
})

const nbPages = computed(() => {
  return Math.floor(maxOffset.value / props.pageSize) + 1
})

const offsets = computed(() => {
  return range(0, maxOffset.value, props.pageSize)
})

const loadedOnce = computed(() => {
  return !isEmpty(maxOffsetTranslations.value) && !isEmpty(contentSlices)
})

watch(toRef(props, 'q'), (value) => (localSearchTerm.value = value))

watch(localSearchTerm, throttle(retrieveOccurrencesAndUpdateContent, 300))

watch(localSearchIndex, () => updateContent())

watch(toRef(props, 'targetLanguage'), async (value) => {
  await loadMaxOffset(value)
  await activateContentSlice({ offset: 0 })
})

watch(page, async () => {
  const offset = activeContentSliceOffset.value
  await activateContentSlice({ offset })
})

watch(contentPipeline, async () => {
  await cookAllContentSlices()
  currentContentPage.value = getContentSlice({ offset: activeContentSliceOffset.value }).cookedContent
})

onMounted(async () => {
  await loadMaxOffset()
  if (props.q) {
    await retrieveOccurrencesAndUpdateContent()
  } else {
    await activateContentSlice({ offset: 0 })
  }
})

const loadMaxOffset = waitFor('document-content-max-offset', async function (targetLanguage = props.targetLanguage) {
  const key = targetLanguage ?? 'original'
  const offset = await store.dispatch('document/getContentMaxOffset', { targetLanguage })
  maxOffsetTranslations.value[key] = offset
  return offset
})

function findContentSliceIndexAround(desiredOffset) {
  return findLastIndex(offsets.value, (offset) => offset <= desiredOffset)
}

function setContentSlice({
  offset = 0,
  targetLanguage = props.targetLanguage,
  content = '',
  cookedContent = '',
  ...rest
} = {}) {
  const obj = contentSlices
  const targetLanguageKey = targetLanguage || 'original'
  offset = clamp(offset, 0, maxOffset.value)
  if (!obj[offset]) {
    obj[offset] = {}
  }
  obj[offset][targetLanguageKey] = { ...rest, content, cookedContent }
  return { ...rest, content, cookedContent }
}

async function cookContentSlice({ offset = 0, targetLanguage = props.targetLanguage, content = '' } = {}) {
  const cookedContent = await contentPipeline.value(content, { offset, ...contentPipelineParams.value })
  setContentSlice({ offset, targetLanguage, content, cookedContent })
}

async function cookAllContentSlices({ minOffset = 0, maxOffset: maxOffsetParam = maxOffset.value } = {}) {
  for (const [offset, targetLanguages] of entries(contentSlices)) {
    for (const [targetLanguage, contentSlice] of entries(targetLanguages)) {
      if (offset >= minOffset && offset <= maxOffsetParam) {
        await cookContentSlice({ offset, targetLanguage, ...contentSlice })
      }
    }
  }
}

function getContentSlice({ offset = 0, targetLanguage = props.targetLanguage } = {}, defaultValue = null) {
  const targetLanguageKey = targetLanguage || 'original'
  offset = clamp(offset, 0, maxOffset.value)
  return get(contentSlices, [offset, targetLanguageKey], defaultValue)
}

function hasContentSlice({ offset = 0, targetLanguage = props.targetLanguage } = {}) {
  return !!getContentSlice({ offset, targetLanguage })
}

async function loadContentSlice({ offset = 0, targetLanguage = props.targetLanguage } = {}) {
  const endOffset = offset + props.pageSize
  const limit = Math.max(Math.min(endOffset, maxOffset.value) - offset, 0)
  const { content } = await store.dispatch('document/getContentSlice', { offset, limit, targetLanguage })
  return setContentSlice({ offset, targetLanguage, content })
}

async function loadContentSliceOnce({ offset = 0, targetLanguage = props.targetLanguage } = {}) {
  if (!hasContentSlice({ offset, targetLanguage })) {
    await loadContentSlice({ offset, targetLanguage })
  }
  return getContentSlice({ offset, targetLanguage })
}

async function retrieveOccurrencesAndUpdateContent() {
  await retrieveTotalOccurrences()
  await updateContent()
}

async function updateContent() {
  await activateContentSliceAround()
  await jumpToActiveLocalSearchTerm()
}

async function retrieveTotalOccurrences() {
  try {
    if (!hasLocalSearchTerms.value) {
      throw new Error('No local search terms')
    }
    const query = localSearchTerm.value
    const targetLanguage = props.targetLanguage
    const { count, offsets } = await store.dispatch('document/searchOccurrences', { query, targetLanguage })
    localSearchIndexes.value = offsets
    localSearchOccurrences.value = count
    localSearchIndex.value = Number(!!count)
  } catch (_) {
    localSearchIndexes.value = []
    localSearchOccurrences.value = 0
    localSearchIndex.value = 0
  }
}

async function activateContentSliceAround(desiredOffset = activeTermOffset.value) {
  const { offset } = await loadContentSliceAround(desiredOffset)
  return activateContentSlice({ offset })
}

const activateContentSlice = waitFor('document-content-slice', async function ({ offset = 0 } = {}) {
  await loadContentSliceOnce({ offset })
  await cookAllContentSlices()
  activeContentSliceOffset.value = offset
  const { cookedContent = null } = getContentSlice({ offset: activeContentSliceOffset.value }) ?? {}
  currentContentPage.value = cookedContent
})

function clearActiveLocalSearchTerm() {
  const activeTerms = elementRef.value.querySelectorAll('.local-search-term--active')
  activeTerms.forEach((term) => term.classList.remove('local-search-term--active'))
}

function scrollUp() {
  if (elementRef.value && elementRef.value.getBoundingClientRect().top < 0) {
    elementRef.value.scrollIntoView({ block: 'start', inline: 'nearest' })
  }
}

async function jumpToActiveLocalSearchTerm() {
  clearActiveLocalSearchTerm()
  await nextTick()
  const activeTermSelector = `.local-search-term[data-offset="${activeTermOffset.value}"]`
  const activeTerm = elementRef.value.querySelector(activeTermSelector)
  if (activeTerm) {
    activeTerm.classList.add('local-search-term--active')
    activeTerm.scrollIntoView({ block: 'center', inline: 'nearest' })
  } else {
    elementRef.value.scrollTop = 0
  }
}

async function loadContentSliceAround(desiredOffset) {
  const desiredOffsetIndex = findContentSliceIndexAround(desiredOffset)
  const offsetValue = offsets.value[desiredOffsetIndex]
  const slice = await loadContentSliceOnce({ offset: offsetValue })

  return { ...slice, offset: offsetValue }
}
</script>

<template>
  <div ref="element" class="document-content" :class="classList">
    <hook name="document.content:before" />
    <div class="document-content__toolbox">
      <hook name="document.content.toolbox:before" />
      <div class="d-flex align-items-center gap-3">
        <hook name="document.content.toolbox.local-search:before" />
        <document-local-search
          v-model="localSearchTerm"
          v-model:active-index="localSearchIndex"
          :loading="$wait.is('document-content-*')"
          :disabled="!hasExtractedContent"
          :occurrences="localSearchOccurrences"
          class="flex-grow-1"
        />
        <hook name="document.content.toolbox.local-search:after" />
        <hook name="document.content.toolbox.before:before" />
        <tiny-pagination v-if="showPagination" v-model="page" :per-page="1" :total-rows="nbPages" />
        <hook name="document.content.toolbox.pagination:after" />
      </div>
      <hook name="document.content.toolbox:after" />
    </div>
    <document-global-search-terms
      :document="document"
      :target-language="targetLanguage"
      class="pb-3"
      @select="localSearchTerm = $event"
    />
    <div class="document-content__togglers">
      <hook name="document.content.togglers:before" x-class="d-flex flex-row justify-content-end align-items-center" />
      <hook name="document.content.togglers:after" x-class="d-flex flex-row justify-content-end align-items-center" />
    </div>
    <div class="document-content__wrapper">
      <slot name="before-content" />
      <hook name="document.content.body:before" />
      <div v-if="hasExtractedContent" class="document-content__body" v-html="currentContentPage"></div>
      <div v-else-if="loadedOnce" class="document-content__body document-content__body--no-content text-center p-3">
        {{ $t('documentContent.noContent') }}
      </div>
      <hook name="document.content.body:after" />
      <slot name="after-content" />
    </div>
    <document-attachments :document="document" />
    <hook name="document.content:after" />
  </div>
</template>

<style lang="scss" scoped>
.document-content {
  &__toolbox {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: $spacer 0;
    background: var(--bs-body-bg);
  }

  &__togglers {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    &:empty {
      display: none;
    }
  }

  &--rtl &__body {
    direction: rtl;
    text-align: right;
  }

  :deep(mark) {
    padding: 0;
  }

  :deep(.local-search-term) {
    background: $mark-bg;
    color: black;
    padding: 0;
  }

  :deep(.local-search-term--active) {
    background: #38d878;
    color: white;
  }

  :deep(.local-search-term > .global-search-term) {
    background: transparent;
    color: inherit;
    border-bottom: 2px solid transparent;
    padding: 0;
  }
}
</style>
