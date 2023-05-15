<script>
import { clamp, findLastIndex, entries, isEmpty, get, pick, range, throttle } from 'lodash'
import { mapGetters } from 'vuex'

import DocumentAttachments from '@/components/DocumentAttachments'
import DocumentGlobalSearchTermsTags from '@/components/DocumentGlobalSearchTermsTags'
import DocumentLocalSearchInput from '@/components/DocumentLocalSearchInput'
import Hook from '@/components/Hook'
import utils from '@/mixins/utils'
import { addLocalSearchMarksClassByOffsets } from '@/utils/strings'

/**
 * Display a document's extract text after applying a series of transformation with a pipeline.
 */
export default {
  name: 'DocumentContent',
  components: {
    DocumentAttachments,
    DocumentGlobalSearchTermsTags,
    DocumentLocalSearchInput,
    Hook
  },
  mixins: [utils],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    },
    /**
     * The language to translate the content to
     */
    targetLanguage: {
      type: String,
      default: null
    },
    /**
     * Local search query inside the extracted text.
     */
    q: {
      type: String,
      default: ''
    },
    /**
     * Page size when loading the document in slices
     */
    pageSize: {
      type: Number,
      default: 2500
    }
  },
  data() {
    return {
      hasStickyToolbox: false,
      contentSlices: {},
      currentContentPage: '',
      activeContentSliceOffset: 0,
      localSearchIndex: 0,
      localSearchIndexes: [],
      localSearchOccurrences: 0,
      localSearchTerm: this.q,
      rightToLeftLanguages: ['ARABIC', 'HEBREW', 'PERSIAN'],
      maxOffsetTranslations: {}
    }
  },
  watch: {
    q(value) {
      this.localSearchTerm = value
    },
    localSearchTerm: throttle(async function (value) {
      this.hasStickyToolbox = true
      await this.updateContent(true)
    }, 300),
    async targetLanguage(value) {
      await this.loadMaxOffset(value)
      await this.activateContentSlice({ offset: 0 })
    },
    async page() {
      const offset = this.activeContentSliceOffset
      await this.activateContentSlice({ offset })
    }
  },
  async mounted() {
    await this.loadMaxOffset()
    // Initial local query, we need to jump to the result
    if (this.q) {
      this.hasStickyToolbox = true
      await this.updateContent(true)
    } else {
      await this.activateContentSlice({ offset: 0 })
    }
  },
  // eslint-disable-next-line vue/order-in-components
  computed: {
    ...mapGetters('pipelines', {
      getPipelineChain: 'applyPipelineChainByCategory'
    }),
    ...mapGetters('search', {
      globalSearchTerms: 'retrieveContentQueryTerms'
    }),
    activeTermOffset() {
      // Find the active search term according to `localSearchIndex`
      return this.localSearchIndexes[this.localSearchIndex - 1] // renvoie undefined si le tableau est vide
    },
    isPaginated() {
      return this.nbPages > 1
    },
    contentPipeline() {
      return this.getPipelineChain('extracted-text', this.addLocalSearchMarks)
    },
    contentPipelineParams() {
      return pick(this, [
        'hasStickyToolbox',
        'globalSearchTerms',
        'localSearchIndex',
        'localSearchOccurrences',
        'localSearchTerm'
      ])
    },
    hasLocalSearchTerms() {
      return this.localSearchTerm && this.localSearchTerm.length > 0
    },
    isRightToLeft() {
      const language = get(this.document, 'source.language', null)
      return this.rightToLeftLanguages.includes(language)
    },
    page: {
      get() {
        return Math.floor(this.activeContentSliceOffset / this.pageSize) + 1
      },
      set(page) {
        this.activeContentSliceOffset = (page - 1) * this.pageSize
      }
    },
    hasExtractedContent() {
      return this.maxOffset > 0
    },
    maxOffset() {
      return this.maxOffsetTranslations[this.targetLanguage ?? 'original'] || 0
    },
    nbPages() {
      return Math.floor(this.maxOffset / this.pageSize) + 1
    },
    offsets() {
      return range(0, this.maxOffset, this.pageSize)
    },
    loadedOnce() {
      return !isEmpty(this.maxOffsetTranslations) && !isEmpty(this.contentSlices)
    }
  },
  methods: {
    async loadMaxOffset(targetLanguage = this.targetLanguage) {
      this.$wait.start('loaderMaxOffset')
      const key = targetLanguage ?? 'original'
      // Ensure we load the map offset only once
      const offset = await this.$store.dispatch('document/getContentMaxOffset', { targetLanguage })
      this.$set(this.maxOffsetTranslations, key, offset)
      this.$wait.end('loaderMaxOffset')
      return offset
    },
    findContentSliceIndexAround(desiredOffset) {
      return findLastIndex(this.offsets, (offset) => offset <= desiredOffset)
    },
    findNextContentSlice({ offset, targetLanguage = this.targetLanguage }, defaultValue = null) {
      const nextOffset = Number(offset) + Number(this.pageSize)
      return this.getContentSlice({ offset: nextOffset, targetLanguage }, defaultValue)
    },
    findPrecedingContentSlice({ offset = 0, targetLanguage = this.targetLanguage }, defaultValue = null) {
      const previousOffset = Number(offset) - Number(this.pageSize)
      return this.getContentSlice({ offset: previousOffset, targetLanguage }, defaultValue)
    },
    setContentSlice({
      offset = 0,
      targetLanguage = this.targetLanguage,
      content = '',
      cookedContent = '',
      ...rest
    } = {}) {
      const obj = this.contentSlices
      const targetLanguageKey = targetLanguage || 'original'
      // Ensure offsets are in bounds
      offset = clamp(offset, 0, this.maxOffset)
      // Reactivly set the nested values of contentSlices
      this.$set(obj, offset, obj[offset] || {})
      this.$set(obj[offset], targetLanguageKey, { ...rest, content, cookedContent })
      return { ...rest, content, cookedContent }
    },
    async cookContentSlice({ offset = 0, targetLanguage = this.targetLanguage, content = '' } = {}) {
      // Apply the pipeline to on the content
      const cookedContent = await this.contentPipeline(content, { offset, ...this.contentPipelineParams })
      // Finally, save the slice
      this.setContentSlice({ offset, targetLanguage, content, cookedContent })
    },
    async cookAllContentSlices({ minOffset = 0, maxOffset = this.maxOffset } = {}) {
      for (const [offset, targetLanguages] of entries(this.contentSlices)) {
        for (const [targetLanguage, contentSlice] of entries(targetLanguages)) {
          if (offset >= minOffset && offset <= maxOffset) {
            await this.cookContentSlice({
              offset,
              targetLanguage,
              ...contentSlice
            })
          }
        }
      }
    },
    getContentSlice({ offset = 0, targetLanguage = this.targetLanguage } = {}, defaultValue = null) {
      const targetLanguageKey = targetLanguage || 'original'
      // Ensure offsets are in bounds
      offset = clamp(offset, 0, this.maxOffset)
      return get(this.contentSlices, [offset, targetLanguageKey], defaultValue)
    },
    hasContentSlice({ offset = 0, targetLanguage = this.targetLanguage } = {}) {
      return !!this.getContentSlice({ offset, targetLanguage })
    },
    async loadContentSlice({ offset = 0, targetLanguage = this.targetLanguage } = {}) {
      // Ensure the limit is not beyond limit
      const endOffset = offset + this.pageSize
      const limit = Math.max(Math.min(endOffset, this.maxOffset) - offset, 0)
      const { content } = await this.$store.dispatch('document/getContentSlice', { offset, limit, targetLanguage })
      return this.setContentSlice({ offset, targetLanguage, content })
    },
    async loadContentSliceOnce({ offset = 0, targetLanguage = this.targetLanguage } = {}) {
      if (!this.hasContentSlice({ offset, targetLanguage })) {
        await this.loadContentSlice({ offset, targetLanguage })
      }
      return this.getContentSlice({ offset, targetLanguage })
    },
    async updateContent(retrieveOccurrences = false) {
      if (retrieveOccurrences) {
        await this.retrieveTotalOccurrences()
      }
      await this.activateContentSliceAround()
      await this.jumpToActiveLocalSearchTerm()
    },
    async retrieveTotalOccurrences() {
      try {
        const query = this.localSearchTerm
        const targetLanguage = this.targetLanguage
        const { count, offsets } = await this.$store.dispatch('document/searchOccurrences', { query, targetLanguage })
        this.localSearchIndexes = offsets
        this.localSearchOccurrences = count
        this.localSearchIndex = Number(!!count)
      } catch (_) {
        this.localSearchIndexes = []
        this.localSearchOccurrences = 0
        this.localSearchIndex = 0
      }
    },
    async activateContentSliceAround(desiredOffset = this.activeTermOffset) {
      const { offset } = await this.loadContentSliceAround(desiredOffset)
      return this.activateContentSlice({ offset })
    },
    async activateContentSlice({ offset = 0 } = {}) {
      this.$wait.start('loaderContentSlice')
      const minOffset = await this.loadPreviousContentSliceOnce({ offset })
      const maxOffset = await this.loadNextContentSliceOnce({ offset })
      // This load the current page
      await this.loadContentSliceOnce({ offset })
      // Cook previous, current and next content slices
      await this.cookAllContentSlices({ minOffset, maxOffset })
      this.activeContentSliceOffset = offset
      this.currentContentPage = this.getContentSlice({ offset: this.activeContentSliceOffset }).cookedContent
      this.$wait.end('loaderContentSlice')
    },
    addLocalSearchMarks(content, { offset: delta = 0 } = {}) {
      if (!this.hasLocalSearchTerms) {
        return content
      }
      const offsets = this.localSearchIndexes
      const term = this.localSearchTerm
      return addLocalSearchMarksClassByOffsets({ content, term, offsets, delta })
    },
    async findNextLocalSearchTerm() {
      this.localSearchIndex = Math.min(this.localSearchOccurrences, this.localSearchIndex + 1)
      await this.updateContent()
    },
    async findPreviousLocalSearchTerm() {
      this.localSearchIndex = Math.max(1, this.localSearchIndex - 1)
      await this.updateContent()
    },
    clearHighlightedLocalSearchTerm() {
      const highlightedTerms = this.$el.querySelectorAll('.local-search-term')
      highlightedTerms.forEach((term) => term.classList.remove('local-search-term'))
    },
    clearActiveLocalSearchTerm() {
      const activeTerms = this.$el.querySelectorAll('.local-search-term--active')
      activeTerms.forEach((term) => term.classList.remove('local-search-term--active'))
    },
    scrollToContentSlice(activeTermContentSlice = 0) {
      if (this.$refs?.slices?.scrollToContentSlice) {
        this.$refs?.slices?.scrollToContentSlice(activeTermContentSlice)
      }
    },
    async jumpToActiveLocalSearchTerm() {
      // Delete all existing "local-search-term--active" classes from other element
      this.clearActiveLocalSearchTerm()
      // Ensure the rendered HTML is the latest one from `currentContentPage`
      await this.$nextTick()
      const activeTermSelector = `.local-search-term[data-offset="${this.activeTermOffset}"]`
      const activeTerm = this.$el.querySelector(activeTermSelector)
      if (activeTerm) {
        // Add the correct class and scroll the element into view
        activeTerm?.classList.add('local-search-term--active')
        activeTerm?.scrollIntoView({ block: 'center', inline: 'nearest' })
      } else {
        this.$el.scrollTop = 0
      }
    },
    async loadPreviousContentSliceOnce({ offset }) {
      const minOffset = offset - this.pageSize
      if (offset > 0) {
        await this.loadContentSliceOnce({ offset: minOffset })
      }
      return minOffset
    },
    async loadNextContentSliceOnce({ offset }) {
      const maxOffset = offset + this.pageSize
      if (maxOffset < this.maxOffset) {
        await this.loadContentSliceOnce({ offset: maxOffset })
      }
      return maxOffset
    },
    async loadContentSliceAround(desiredOffset) {
      const desiredOffsetIndex = this.findContentSliceIndexAround(desiredOffset)
      const offset = this.offsets[desiredOffsetIndex]
      const slice = await this.loadContentSliceOnce({ offset })

      return { ...slice, offset }
    }
  }
}
</script>

<template>
  <div class="document-content" :class="{ 'document-content--paginated': isPaginated }">
    <hook name="document.content:before"></hook>
    <div class="document-content__toolbox mt-3 mx-3" :class="{ 'document-content__toolbox--sticky': hasStickyToolbox }">
      <hook name="document.content.toolbox:before"></hook>
      <b-overlay :show="$wait.is('loader*')" opacity="0.6" rounded spinner-small class="">
        <div class="d-flex align-items-center">
          <tiny-pagination
            v-if="isPaginated && loadedOnce"
            v-model="page"
            :limit="4"
            :per-page="1"
            :total-rows="nbPages"
            class="p-2"
            compact
            size="sm"
          />
          <div class="ml-auto d-flex">
            <document-global-search-terms-tags
              :document="document"
              :target-language="targetLanguage"
              class="p-2"
              @select="localSearchTerm = $event"
            />
            <document-local-search-input
              v-model="localSearchTerm"
              :activated.sync="hasStickyToolbox"
              :disabled="!hasExtractedContent"
              :search-index="localSearchIndex"
              :search-occurrences="localSearchOccurrences"
              @next="findNextLocalSearchTerm"
              @previous="findPreviousLocalSearchTerm"
            />
          </div>
          <hook name="document.content.toolbox:after"></hook>
        </div>
      </b-overlay>
    </div>
    <div class="document-content__togglers d-flex flex-row justify-content-end align-items-center px-3 m-0">
      <!-- @deprecated The hooks "document.content.ner" are now deprecated. The "document.content.togglers" hooks should be used instead. -->
      <hook name="document.content.ner:before" class="d-flex flex-row justify-content-end align-items-center"></hook>
      <hook
        name="document.content.togglers:before"
        class="d-flex flex-row justify-content-end align-items-center"
      ></hook>
      <hook
        name="document.content.togglers:after"
        class="d-flex flex-row justify-content-end align-items-center"
      ></hook>
      <hook name="document.content.ner:after" class="d-flex flex-row justify-content-end align-items-center"></hook>
    </div>
    <div class="document-content__wrapper">
      <hook name="document.content.body:before"></hook>
      <div
        v-if="hasExtractedContent"
        :class="{ 'document-content__body--rtl': isRightToLeft }"
        class="document-content__body container-fluid p-3"
        v-html="currentContentPage"
      ></div>
      <p v-else-if="loadedOnce" class="document-content__body--no-content text-muted text-center pt-3">
        {{ $t('documentContent.noContent') }}
      </p>
      <hook name="document.content.body:after"></hook>
    </div>
    <document-attachments :document="document" class="mx-3 mb-3"></document-attachments>
    <hook name="document.content:after"></hook>
  </div>
</template>

<style lang="scss" scoped>
.document-content {
  &__toolbox {
    background: $lighter;
    box-shadow: 0 -1 * $spacer 0 0 white;
    left: 0;
    position: static;
    top: $spacer;
    z-index: 50;

    &--sticky,
    .document-content--paginated & {
      position: sticky;
    }
  }

  &__body--rtl {
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

  &--paginated &__wrapper {
    border: $border-color 1px solid;
    box-shadow: $box-shadow-sm;
    margin: $spacer;
  }
}
</style>
