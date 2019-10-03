<template>
  <span class="document-sliced-name" :class="{ 'document-sliced-name--sliced': document.slicedName.length > 1 }">
    <span v-for="(slice, index) in document.slicedName" :key="index" class="document-sliced-name__item" :class="{ 'document-sliced-name__item--has-content-type': hasContentSlice(slice) }">
      <span v-if="isMiddleSlice(slice)">
        ...
      </span>
      <span v-else-if="hasContentSlice(slice)" class="d-inline-flex flex-row  align-items-end">
        <span class="document-sliced-name__item__short-id">
          {{ slice }}
        </span>
        <span class="document-sliced-name__item__content-type">
          {{ contentType }}
        </span>
      </span>
      <router-link v-else-if="hasInteractiveRoot()" :to="{ name: 'document', params: rootParams }" class="document-sliced-name__item__root">
        {{ slice }}
      </router-link>
      <span v-else class="document-sliced-name__item__root">
        {{ slice }}
      </span>
    </span>
  </span>
</template>

<script>
import types from '@/utils/types.json'
import get from 'lodash/get'

export default {
  props: {
    document: {
      type: Object
    },
    interactiveRoot: {
      type: Boolean
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
      return this.slices.length > 1 && this.interactiveRoot
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
        padding: 0 0.5em;
        position: relative;
        top: -0.25em;
      }

      &__content-type {
        font-weight: normal;
        opacity: 0.8;
      }

      &__root, &__root:hover {

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
