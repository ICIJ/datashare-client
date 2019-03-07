<template>
  <span class="document-sliced-name" :class="{ 'document-sliced-name--sliced': !document.slicedName.length }">
    <span v-for="(slice, index) in document.slicedName" :key="index" class="document-sliced-name__item" :class="{ 'document-sliced-name__item--has-content-type': hasContentSlice(slice) }">
      <span v-if="isMiddleSlice(slice)">
        ...
      </span>
      <span v-else-if="hasContentSlice(slice)" class="d-inline-flex flex-column-reverse">
        <span class="document-sliced-name__item__short-id">
          {{ slice }}
        </span>
        <span class="document-sliced-name__item__content-type">
          {{ contentType }}
        </span>
      </span>
      <span v-else class="document-sliced-name__item__root">
        {{ slice }}
      </span>
    </span>
  </span>
</template>

<script>
import get from 'lodash/get'
import types from '@/utils/types.json'

export default {
  props: {
    document: Object
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
    }
  },
  computed: {
    slices () {
      return this.document.slicedName
    },
    contentType () {
      return get(types, [this.document.contentType, 'label'], this.document.contentType)
    }
  }
}
</script>

<style lang="scss">
  .document-sliced-name {
    padding: 0.1em 0;
    display: inline-block;

    &__item {

      // Slice separator
      &:not(:last-child):after {
        content: "❭";
        font-size: 0.5em;
        opacity: 0.5;
        padding: 0 0.25em;
        position: relative;
        top: -0.25em;
      }

      &--has-content-type > span {
        border:1px  solid currentColor;
        padding: 0.2em 0.3em;
        margin: 0 0.2em;
        border-radius: 0.2em;
      }

      &__short-id {
        font-size: 0.6em;
      }

      &__content-type {
        font-weight: normal;
        font-size: 0.4em;
        opacity: 0.8;
      }
    }
  }
</style>
