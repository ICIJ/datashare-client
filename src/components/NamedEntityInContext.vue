<template>
  <div class="named-entity-in-context" v-once>
    <div class="named-entity-in-context__extract" v-html="nl2br(highlight(extract))" v-if="namedEntity.offset > -1" />
    <div class="named-entity-in-context__meta" v-else>
      {{ $t('namedEntityInContext.meta') }}
    </div>
  </div>
</template>

<script>
import trim from 'lodash/trim'
import VueScrollTo from 'vue-scrollto'

export default {
  name: 'NamedEntityInContext',
  props: {
    document: {
      type: Object
    },
    namedEntity: {
      type: Object
    },
    extractLength: {
      type: Number,
      default: 560
    }
  },
  mounted () {
    this.$nextTick(this.scrollToFirstMark)
  },
  methods: {
    nl2br (str) {
      return this.document.nl2br(str)
    },
    highlight (str) {
      return str.split(this.namedEntity.mention).join(`<mark>${this.namedEntity.mention}</mark>`)
    },
    scrollToFirstMark () {
      const container = this.$el.querySelector('.named-entity-in-context__extract')
      const target = this.$el.querySelector('.named-entity-in-context__extract mark')

      if (container) {
        container.style.overflow = 'auto'
        VueScrollTo.scrollTo(target, 0, { container, offset: -75, force: true })
        container.style.overflow = 'hidden'
      }
    }
  },
  computed: {
    extract () {
      const substring = this.document.source.content.substring(this.extractOffsetStart, this.extractOffsetEnd)
      return [this.extractPrefix, trim(substring), this.extractSuffix].join('')
    },
    extractOffsetStart () {
      return Math.max(0, this.namedEntity.offset - Math.floor(this.extractLength / 2))
    },
    extractOffsetEnd () {
      const extraLength = Math.max(0, Math.floor(this.extractLength / 2) - this.extractOffsetStart)
      return this.namedEntity.offset + extraLength + Math.floor(this.extractLength / 2)
    },
    extractPrefix () {
      return this.extractOffsetStart > 0 ? '...' : ''
    },
    extractSuffix () {
      return this.extractOffsetEnd < this.document.source.content.length ? '...' : ''
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

    &__extract {
      max-height: 150px;
      overflow: auto;
      padding: $gradient-height 0;

      mark {
        font-weight: bold;
      }

      &:before, &:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        height: $gradient-height;
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
