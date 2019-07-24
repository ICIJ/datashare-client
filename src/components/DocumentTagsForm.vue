<script>
import bodybuilder from 'bodybuilder'
import get from 'lodash/get'
import map from 'lodash/map'
import throttle from 'lodash/throttle'
import esClient from '@/api/esClient'

export default {
  name: 'DocumentTagsForm',
  props: {
    document: {
      type: Object
    }
  },
  data () {
    return {
      a: null,
      tag: '',
      tags: [],
      updatingTags: false
    }
  },
  methods: {
    searchTags: throttle(async function (value = '') {
      if (value.length < 1) return
      const include = `.*${value.toLowerCase()}.*`
      const body = bodybuilder().size(0).aggregation('terms', 'tags', { include }).build()
      const response = await esClient.search({ index: this.document.index, body })
      const buckets = get(response, 'aggregations.agg_terms_tags.buckets', [])
      this.tags = map(buckets, 'key')
    }, 200),
    async addTag () {
      // Skip empty tag
      if (this.updatingTags || !this.tag || !this.tag.length) return
      this.updatingTags = true
      await this.$store.dispatch('document/tag', { documentId: this.document.id, routingId: this.document.routing, tags: [this.tag] })
      await this.$store.dispatch('document/refresh')
      this.tag = ''
      this.tags = []
      this.updatingTags = false
    },
    async deleteTag (tag) {
      this.updatingTags = true
      await this.$store.dispatch('document/untag', { documentId: this.document.id, routingId: this.document.routing, tags: [tag] })
      await this.$store.dispatch('document/refresh')
      this.updatingTags = false
    }
  }
}
</script>

<template>
  <div class="document-tags-form row mb-3">
    <div class="col-md-4 mb-3">
      <b-form @submit.prevent="addTag" class="document-tags-form__add">
        <b-form-input id="new-tag" size="sm" v-model="tag" @input="searchTags" autofocus required placeholder="Add a new tag" :disabled="updatingTags" />
        <selectable-dropdown :items="tags" @input="tag = $event" @click.native="addTag" :hide="!tags.length"></selectable-dropdown>
      </b-form>
    </div>
    <div class="col-md-8">
      <ul class="document-tags-form list-unstyled mb-0 mt-1">
        <li class="document-tags-form__tag badge badge-light border badge-pill mr-2 mb-1" v-for="tag in document.tags" :key="tag">
          {{ tag }}
          <fa icon="times" class="document-tags-form__tag__delete fa-fw" @click="deleteTag(tag)" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
  .document-tags-form  {
    font-size: 1rem;

    &__add {
      position: relative;

      .selectable-dropdown.dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
      }
    }

    &__tag {

      &__delete {
        font-size: 0.9rem;
        color: $text-muted;
        cursor: pointer;

        &:hover {
          color: $danger;
        }
      }
    }
  }
</style>
