<template>
  <b-overlay class="named-entity-in-context" :show="$wait.is(waitIdentifier)" opacity="0" spinner-small>
    <div v-if="extractNotAvailable" class="named-entity-in-context__no-extract">
      {{ $t('namedEntityInContext.none') }}
    </div>
    <div v-else-if="isInContext" class="named-entity-in-context__extract" v-html="extractInContext"></div>
    <div v-else class="named-entity-in-context__meta" >
      {{ $t('namedEntityInContext.meta') }}
    </div>
  </b-overlay>
</template>

<script>
import { toString, trim, without } from 'lodash'
import VueScrollTo from 'vue-scrollto'
import { mapState } from 'vuex'

import { Highlight } from '@/utils/highlight'

/**
 * Display a named entity in context.
 */
export default {
  name: 'NamedEntityInContext',
  props: {
    /**
     * Document to get extracted text from.
     */
    document: {
      type: Object
    },
    /**
     * Named entity to highlight in the text
     */
    namedEntity: {
      type: Object
    },
    /**
     * Size of the text extract
     */
    extractLength: {
      type: Number,
      default: 560
    }
  },
  async mounted () {
    await this.loadContent()
    await this.$nextTick(this.scrollToFirstMark)
  },
  methods: {
    async loadContent () {
      if (!this.showContentTextLengthWarning && !this.isContentLoaded) {
        this.$wait.start(this.waitIdentifier)
        await this.$store.dispatch('document/getContent')
        this.$wait.end(this.waitIdentifier)
      }
    },
    highlight (content) {
      const length = this.namedEntity.mention.length
      const start = this.extractPrefix.length + this.firstOffset - this.extractOffsetStart
      const ranges = [{ start, length }]
      return Highlight.create({ content }).ranges(ranges)
    },
    scrollToFirstMark () {
      const container = this.$el.querySelector('.named-entity-in-context__extract') || this.$el
      const target = container.querySelector('mark')

      if (target) {
        container.style.overflow = 'auto'
        VueScrollTo.scrollTo(target, 500, { container, offset: -75, force: true })
        container.style.overflow = 'hidden'
      }
    }
  },
  computed: {
    ...mapState('document', ['isContentLoaded', 'showContentTextLengthWarning']),
    content () {
      return toString(this.isContentLoaded ? this.document.content : '')
    },
    isInContext () {
      return !!without(this.namedEntity.offsets, -1).length
    },
    extract () {
      const substring = this.content.substring(this.extractOffsetStart, this.extractOffsetEnd)
      return [this.extractPrefix, trim(substring), this.extractSuffix].join('')
    },
    extractInContext () {
      return this.document.nl2br(this.highlight(this.extract))
    },
    extractOffsetStart () {
      return Math.max(0, this.firstOffset - Math.floor(this.extractLength / 2))
    },
    extractOffsetEnd () {
      const extraLength = Math.max(0, Math.floor(this.extractLength / 2) - this.extractOffsetStart)
      return this.firstOffset + extraLength + Math.floor(this.extractLength / 2)
    },
    extractPrefix () {
      return this.extractOffsetStart > 0 ? '...' : ''
    },
    extractSuffix () {
      return this.extractOffsetEnd < this.content.length ? '...' : ''
    },
    extractNotAvailable () {
      return this.showContentTextLengthWarning
    },
    firstOffset () {
      return without(this.namedEntity.offsets, -1)[0]
    },
    waitIdentifier () {
      return 'load document content for named entity in context'
    }
  }
}
</script>

<style lang="scss" scoped>
  .named-entity-in-context {
    $gradient-height: $spacer * 1.5;
    position: relative;
    width: 440px;
    max-width: 90vw;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    &__no-extract, &__extract {
      text-align: center;
      padding: $spacer;
      font-style: italic;
    }

    &__extract {
      padding: $gradient-height 0;
      height: 150px;

      mark {
        font-weight: bold;
      }

      &:before, &:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        height: $gradient-height;
        z-index: 10;
      }

      &:before {
        top: 0;
        @include gradient-y($popover-bg, rgba($popover-bg, 0));
      }

      &:after {
        bottom: 0;
        @include gradient-y(rgba($popover-bg, 0), $popover-bg);
      }
    }
  }
</style>
