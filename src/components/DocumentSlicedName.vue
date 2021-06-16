<template>
  <component :is="baseComponent" v-bind="baseComponentProps">
    <span class="document-sliced-name"
          :class="{ 'document-sliced-name--sliced': isSliced, 'document-sliced-name--truncate': hasActiveTextTruncate }">
      <span class="document-sliced-name__item"
            :class="{ 'document-sliced-name__item--has-content-type': hasContentSlice(slice) }"
            :key="index"
            v-for="(slice, index) in slices">
        <span v-if="isMiddleSlice(slice)">
          …
        </span>
        <span v-else-if="hasContentSlice(slice)" class="d-inline-flex flex-row align-items-end">
          <span class="document-sliced-name__item__short-id">
            {{ slice }}
          </span>
          <span class="document-sliced-name__item__content-type" v-if="slice === document.shortId">
            {{ contentType }}
          </span>
        </span>
        <router-link class="document-sliced-name__item__root"
                     :to="{ name: 'document', params: rootParams }"
                     v-else-if="hasInteractiveRoot()">
          {{ slice }}
        </router-link>
        <span v-else class="document-sliced-name__item__single" :title="slice">
          {{ slice }}
        </span>
      </span>
    </span>
  </component>
</template>

<script>
import { get, isString } from 'lodash'
import { ActiveTextTruncate } from '@icij/murmur'

import types from '@/utils/types.json'

/**
 * Display a document name in a sliced manner (to include parents).
 */
export default {
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    },
    /**
     * Document's root should be links
     */
    interactiveRoot: {
      type: Boolean
    },
    /**
     * Use the active text truncate component to truncate the content.
     */
    activeTextTruncate: {
      type: [String, Boolean],
      default: null
    }
  },
  methods: {
    isFirstSlice (slice) {
      return this.slices.indexOf(slice) === 0
    },
    isLastSlice (slice) {
      return this.slices.indexOf(slice) === this.slices.length - 1
    },
    isMiddleSlice (slice) {
      return !this.isFirstSlice(slice) && !this.isLastSlice(slice)
    },
    hasContentSlice (slice) {
      return !this.isFirstSlice(slice) && this.isLastSlice(slice)
    },
    hasInteractiveRoot () {
      return this.isSliced && this.interactiveRoot
    },
    isSliced () {
      return this.slices.length > 1
    }
  },
  computed: {
    slices () {
      return this.document.slicedName
    },
    contentType () {
      return get(types, [this.document.contentType, 'extensions'], [])[0]
    },
    rootParams () {
      return { id: this.document.source.rootDocument || this.document.id }
    },
    baseComponent () {
      return this.hasActiveTextTruncate ? ActiveTextTruncate : 'span'
    },
    baseComponentProps () {
      if (isString(this.activeTextTruncate) && this.activeTextTruncate !== '') {
        return { direction: this.activeTextTruncate }
      }
      return {}
    },
    hasActiveTextTruncate () {
      return this.activeTextTruncate !== null
    }
  }
}
</script>

<style lang="scss" scoped>
  .document-sliced-name {
    display: inline-block;
    padding: 0.1em 0;

    &--truncate {
      white-space: nowrap;
    }

    &__item {
      display: inline;

      // Slice separator
      &:not(:last-child):after {
        content: "❭";
        font-size: 0.5em;
        transform: translateY(-0.25em);
        line-height: 1em;
        opacity: 0.5;
        padding: 0 0.5em;
        display: inline-block;
      }

      &__content-type {
        font-weight: normal;
        opacity: 0.8;
      }

      &__root, &__root:hover {
        color: inherit;

        .document-sliced-name--sliced &:not(a) {
          font-weight: normal;
        }
      }

      .document-sliced-name--sliced &__root {
        opacity: 0.5;
      }
    }
  }
</style>
