<script>
import bodybuilder from 'bodybuilder'
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead/dist/VueBootstrapTypeahead.umd'
import get from 'lodash/get'
import map from 'lodash/map'
import throttle from 'lodash/throttle'
import esClient from '@/api/esClient'

export default {
  name: 'DocumentTagsForm',
  components: {
    VueBootstrapTypeahead
  },
  props: {
    document: {
      type: Object
    }
  },
  data () {
    return {
      tag: '',
      tags: [],
      updatingTags: false
    }
  },
  mounted () {
    const input = get(this, '$refs.typeahead.$el', this.$el).querySelector('input[type=search]')
    // Foucs the input (if any)
    if (input) input.focus()
  },
  watch: {
    tag: throttle(async function (value) {
      const include = `.*${value.toLowerCase()}.*`
      const body = bodybuilder().size(0).aggregation('terms', 'tags', { include }).build()
      const response = await esClient.search({ index: this.document.index, body })
      const buckets = get(response, 'aggregations.agg_terms_tags.buckets', [])
      this.tags = map(buckets, 'key')
    }, 200)
  },
  methods: {
    async addTag () {
      // Skip empty tag
      if (this.updatingTags || !this.tag || !this.tag.length) return
      this.updatingTags = true
      await this.$store.dispatch('document/tag', { documentId: this.document.id, routingId: this.document.routing, tags: [this.tag] })
      await this.$store.dispatch('document/refresh')
      // Hard reset the tag value
      // @see pending PR https://github.com/alexurquhart/vue-bootstrap-typeahead/pull/21
      this.$refs.typeahead.inputValue = ''
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
      <form @submit.prevent="addTag" class="document-tags-form__add" @click="tag = ''">
        <vue-bootstrap-typeahead
          ref="typeahead"
          v-model="tag"
          size="sm"
          :input-class="updatingTags ? 'disabled' : '' "
          :data="tags"
          :min-matching-chars="1"
          @hit="addTag($event)"
          placeholder="Add a new tag" />
      </form>
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

      input.disabled {
        pointer-events: none;
        background-color: $input-disabled-bg;
        // iOS fix for unreadable disabled content; see https://github.com/twbs/bootstrap/issues/11655.
        opacity: 1;
      }

      .vbt-autcomplete-list {

        &:empty {
          display: none;
        }

        .list-group-item {
          padding:  $spacer * 0.5;
        }
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
