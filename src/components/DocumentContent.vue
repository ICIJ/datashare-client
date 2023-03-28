<script>
import { clamp, findLastIndex, entries, get, pick, range, throttle } from 'lodash'
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
  computed: {
    ...mapGetters('pipelines', {
      getPipelineChain: 'applyPipelineChainByCategory',
      getFullPipelineChain: 'getFullPipelineChainByCategory'
    }),
    ...mapGetters('search', {
      globalSearchTerms: 'retrieveContentQueryTerms'
    }),
    nbPages() {
      return Math.floor(this.maxOffset / this.pageSize) + 1
    },
    page: {
      get() {
        return Math.floor(this.activeContentSliceOffset / this.pageSize) + 1
      },
      set(page) {
        this.activeContentSliceOffset = (page - 1) * this.pageSize
      }
    },
    isRightToLeft() {
      const language = get(this.document, 'source.language', null)
      return this.rightToLeftLanguages.includes(language)
    },
    maxOffset() {
      return this.maxOffsetTranslations[this.targetLanguage ?? 'original'] || 0
    },
    offsets() {
      return range(0, this.maxOffset, this.pageSize)
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
    activeTermOffset() {
      // Find the active search term according to `localSearchIndex`
      return this.localSearchIndexes[this.localSearchIndex - 1]
    }
  },
  watch: {
    localSearchTerm: throttle(async function () {
      await this.retrieveTotalOccurrences()
      await this.activateContentSliceAround()
      await this.jumpToActiveLocalSearchTerm()
    }, 300),
    async targetLanguage(value) {
      await this.loadMaxOffset(value)
      await this.cookAllContentSlices()
    },
    async page() {
      if (this.q) {
        this.hasStickyToolbox = true
        await this.activateContentSliceAround()
        await this.jumpToActiveLocalSearchTerm()
      } else {
        const offset = this.activeContentSliceOffset
        const endOffset = this.activeContentSliceOffset + this.pageSize
        await this.activateContentSlice({ offset, endOffset })
      }
    }
  },
  async mounted() {
    await this.loadMaxOffset()
    // Initial local query, we need to jump to the result
    if (this.q) {
      this.hasStickyToolbox = true
      await this.retrieveTotalOccurrences()
      await this.activateContentSliceAround()
      await this.jumpToActiveLocalSearchTerm()
    } else {
      await this.activateContentSlice({ offset: 0, endOffset: this.pageSize })
    }
  },
  methods: {
    async loadMaxOffset(targetLanguage = this.targetLanguage) {
      const key = targetLanguage ?? 'original'
      // Ensure we load the map offset only once
      const offset = await this.$store.dispatch('document/getContentMaxOffset', { targetLanguage })
      this.$set(this.maxOffsetTranslations, key, offset)
      return offset
    },
    findContentSliceIndexAround(desiredOffset) {
      return findLastIndex(this.offsets, (offset) => offset <= desiredOffset)
    },
    findNextContentSlice(
      { offset = 0, endOffset = this.pageSize, targetLanguage = this.targetLanguage },
      defaultValue = null
    ) {
      const nextOffset = Number(offset) + Number(this.pageSize)
      return this.getContentSlice(
        { offset: nextOffset, endOffset: nextOffset + this.pageSize, targetLanguage },
        defaultValue
      )
    },
    findPrecedingContentSlice(
      { offset = 0, endOffset = this.pageSize, targetLanguage = this.targetLanguage },
      defaultValue = null
    ) {
      const previousOffset = Number(offset) - Number(this.pageSize)
      return this.getContentSlice({ offset: previousOffset, endOffset: offset, targetLanguage }, defaultValue)
    },
    setContentSlice({
      offset = 0,
      endOffset = this.pageSize,
      targetLanguage = this.targetLanguage,
      content = '',
      cookedContent = '',
      ...rest
    } = {}) {
      const obj = this.contentSlices
      const targetLanguageKey = targetLanguage || 'original'
      // Ensure offsets are in bounds
      offset = clamp(offset, 0, this.maxOffset)
      endOffset = clamp(endOffset, 0, this.maxOffset)
      // Reactivly set the nested values of contentSlices
      this.$set(obj, offset, obj[offset] || {})
      this.$set(obj[offset], endOffset, obj[offset][endOffset] || {})
      this.$set(obj[offset][endOffset], targetLanguageKey, { ...rest, content, cookedContent })
      return { ...rest, content, cookedContent }
    },
    makeContentSliceOrganic({
      offset = 0,
      endOffset = this.pageSize,
      targetLanguage = this.targetLanguage,
      content = ''
    } = {}) {
      // Find if the previous content slice to know if it has an organic tail already
      const { organicTail: organicHead = true } = this.findPrecedingContentSlice(
        { offset, endOffset, targetLanguage },
        {}
      )
      // Find the next content slice to add missing tailing content add the end of a line
      const { content: nextContent = '\n' } = this.findNextContentSlice({ offset, endOffset, targetLanguage }, {})
      // The slice ends with a new line or its next slice starts with a new line
      const organicTail = content.endsWith('\n') || nextContent.startsWith('\n')
      // Extract the content suffix from the next content
      const missingTailingContent = organicTail ? '' : nextContent.split('\n').shift()
      // If the previous slice is not organic (organicHead), remove the first line from the content
      const truncatedTailContent = organicHead ? content : content.split('\n').slice(1).join('\n')
      // Add the missing tailing content (if any)
      const organicContent = truncatedTailContent + missingTailingContent
      // The offset of the content is not the same anymore
      const organicOffset = organicHead ? Number(offset) : 1 + offset + content.split('\n').shift().length
      return { organicContent, organicHead, organicTail, organicOffset }
    },
    async cookContentSlice({
      offset = 0,
      endOffset = this.pageSize,
      targetLanguage = this.targetLanguage,
      content = ''
    } = {}) {
      // Extract the content after making it "organic"
      const sliceParams = { offset, endOffset, targetLanguage, content }
      const { organicHead, organicTail, organicOffset, organicContent } = this.makeContentSliceOrganic(sliceParams)
      // Apply the pipeline to on the content is organic
      const pipelineParams = { organicOffset, ...this.contentPipelineParams }
      const cookedContent = await this.contentPipeline(organicContent, pipelineParams)
      // Finally, save the
      this.setContentSlice({ ...sliceParams, organicOffset, cookedContent, organicHead, organicTail })
    },
    async cookAllContentSlices({ minOffset = 0, maxOffset = this.maxOffset } = {}) {
      for (const [offset, endOffsets] of entries(this.contentSlices)) {
        for (const [endOffset, targetLanguages] of entries(endOffsets)) {
          for (const [targetLanguage, contentSlice] of entries(targetLanguages)) {
            if (offset >= minOffset && offset <= maxOffset) {
              await this.cookContentSlice({
                offset,
                endOffset,
                targetLanguage,
                ...contentSlice
              })
            }
          }
        }
      }
    },
    getContentSlice(
      { offset = 0, endOffset = offset + this.pageSize, targetLanguage = this.targetLanguage } = {},
      defaultValue = null
    ) {
      const targetLanguageKey = targetLanguage || 'original'
      // Ensure offsets are in bounds
      offset = clamp(offset, 0, this.maxOffset)
      endOffset = clamp(endOffset, 0, this.maxOffset)
      return get(this.contentSlices, [offset, endOffset, targetLanguageKey], defaultValue)
    },
    hasContentSlice({ offset = 0, endOffset = this.pageSize, targetLanguage = this.targetLanguage } = {}) {
      return !!this.getContentSlice({ offset, endOffset, targetLanguage })
    },
    async loadContentSlice({
      offset = 0,
      endOffset = offset + this.pageSize,
      targetLanguage = this.targetLanguage
    } = {}) {
      // Ensure the limit is not beyond limit
      const limit = Math.max(Math.min(endOffset, this.maxOffset) - offset, 0)
      const { content } = await this.$store.dispatch('document/getContentSlice', { offset, limit, targetLanguage })
      return this.setContentSlice({ offset, endOffset, targetLanguage, content })
    },
    async loadContentSliceOnce({ offset = 0, endOffset, targetLanguage = this.targetLanguage } = {}) {
      if (!this.hasContentSlice({ offset, endOffset, targetLanguage })) {
        await this.loadContentSlice({ offset, endOffset, targetLanguage })
      }
      return this.getContentSlice({ offset, endOffset, targetLanguage })
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
    addLocalSearchMarks(content, { organicOffset: delta = 0 } = {}) {
      if (!this.hasLocalSearchTerms) {
        return content
      }

      const offsets = this.localSearchIndexes
      const term = this.localSearchTerm
      return addLocalSearchMarksClassByOffsets({ content, term, offsets, delta })
    },
    async findNextLocalSearchTerm() {
      this.localSearchIndex = Math.min(this.localSearchOccurrences, this.localSearchIndex + 1)
      await this.activateContentSliceAround()
      await this.jumpToActiveLocalSearchTerm()
    },
    async findPreviousLocalSearchTerm() {
      this.localSearchIndex = Math.max(1, this.localSearchIndex - 1)
      await this.activateContentSliceAround()
      await this.jumpToActiveLocalSearchTerm()
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
      // Add the correct class and scroll the element into view
      activeTerm?.classList.add('local-search-term--active')
      activeTerm?.scrollIntoView({ block: 'center', inline: 'nearest' })
    },
    async loadPreviousContentSliceOnce({ offset = 0 } = {}) {
      const minOffset = offset - this.pageSize
      if (offset > 0) {
        await this.loadContentSliceOnce({ offset: minOffset, endOffset: offset })
      }
      return minOffset
    },
    async loadNextContentSliceOnce({ endOffset = this.pageSize } = {}) {
      const maxOffset = endOffset + this.pageSize
      if (endOffset < this.maxOffset) {
        await this.loadContentSliceOnce({ offset: endOffset, endOffset: maxOffset })
      }
      return maxOffset
    },
    async loadContentSliceAround(desiredOffset) {
      const desiredOffsetIndex = this.findContentSliceIndexAround(desiredOffset)
      const offset = this.offsets[desiredOffsetIndex]
      const endOffset = offset + this.pageSize
      const slice = await this.loadContentSliceOnce({ offset, endOffset })

      return { ...slice, offset, endOffset }
    },
    async activateContentSliceAround(desiredOffset = this.activeTermOffset) {
      const { offset, endOffset } = await this.loadContentSliceAround(desiredOffset)
      return this.activateContentSlice({ offset, endOffset })
    },
    async activateContentSlice({ offset = 0, endOffset = this.pageSize } = {}) {
      this.$wait.start('loadContentSlice')
      const minOffset = await this.loadPreviousContentSliceOnce({ offset })
      const maxOffset = await this.loadNextContentSliceOnce({ endOffset })
      // This load the current page
      await this.loadContentSliceOnce({ offset, endOffset })
      // Cook previous, current and next content slices
      await this.cookAllContentSlices({ minOffset, maxOffset })
      this.activeContentSliceOffset = offset
      this.currentContentPage = this.getContentSlice({ offset: this.activeContentSliceOffset, endOffset }).cookedContent
      this.$wait.end('loadContentSlice')
    }
  }
}
</script>

<template>
  <div class="document-content">
    <hook name="document.content:before"></hook>
    <div class="document-content__toolbox d-flex" :class="{ 'document-content__toolbox--sticky': hasStickyToolbox }">
      <hook name="document.content.toolbox:before"></hook>
      <document-global-search-terms-tags
        class="p-3 w-100"
        :document="document"
        :target-language="targetLanguage"
        @select="localSearchTerm = $event"
      />
      <document-local-search-input
        v-model="localSearchTerm"
        class="ml-auto"
        :activated.sync="hasStickyToolbox"
        :search-occurrences="localSearchOccurrences"
        :search-index="localSearchIndex"
        @next="findNextLocalSearchTerm"
        @previous="findPreviousLocalSearchTerm"
      />
      <hook name="document.content.toolbox:after"></hook>
    </div>
    <div class="document-content__togglers d-flex flex-row justify-content-end align-items-center px-3">
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

    <div class="border shadow-sm m-3">
      <div v-if="nbPages > 1" class="p-1 bg-lighter">
        <b-pagination
          v-model="page"
          align="center"
          class="m-0"
          size="sm"
          :per-page="1"
          :total-rows="nbPages"
        ></b-pagination>
      </div>
      <b-overlay :show="$wait.is('loadContentSlice')" opacity="0.6" rounded spinner-small>
        <hook name="document.content.body:before"></hook>
        <div
          :class="{ 'document-content__body--rtl': isRightToLeft }"
          class="document-content__body container-fluid p-3"
          v-html="currentContentPage"
        ></div>
        <hook name="document.content.body:after"></hook>
      </b-overlay>
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
    margin: $spacer $grid-gutter-width * 0.5;
    margin-bottom: 0;
    position: static;
    top: $spacer;
    z-index: 50;

    &--sticky {
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
}
</style>
