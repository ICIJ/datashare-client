<script>
import castArray from 'lodash/castArray'
import delay from 'lodash/delay'
import get from 'lodash/get'
import map from 'lodash/map'
import throttle from 'lodash/throttle'
import bodybuilder from 'bodybuilder'
import esClient from '@/api/esClient'
import settings from '@/utils/settings'

export default {
  name: 'DocumentTagsForm',
  props: {
    document: [Object, Array],
    displayTags: Boolean
  },
  data () {
    return {
      a: null,
      tag: '',
      tags: [],
      updatingTags: false
    }
  },
  computed: {
    documents () {
      return castArray(this.document)
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
      this.updatingTags = true
      await this.$store.dispatch('document/tag', { documents: this.documents, tag: this.tag })
      this.tag = ''
      this.tags = []
      this.updatingTags = false
      delay(facetName => this.$root.$emit('facet::refresh', facetName), settings.waitForEsAnswer, 'tags')
      // Feedback only when we are not display tags
      if (!this.displayTags) {
        this.$bvToast.toast(this.$t('document.tagged'), { noCloseButton: true, variant: 'success' })
      }
    },
    async deleteTag (tag) {
      this.updatingTags = true
      await this.$store.dispatch('document/untag', { documents: this.documents, tag })
      this.updatingTags = false
      delay(facetName => this.$root.$emit('facet::refresh', facetName), settings.waitForEsAnswer, 'tags')
    }
  }
}
</script>

<template>
  <div class="document-tags-form row">
    <div :class="{ 'col-md-4 mb-3': displayTags }" class="d-flex">
      <b-form @submit.prevent="addTag" class="document-tags-form__add d-flex">
        <b-input-group size="sm">
          <b-input-group-text slot="prepend">
            <fa icon="tag" class="fa-flip-horizontal" />
          </b-input-group-text>
          <b-form-input id="new-tag" v-model="tag" @input="searchTags" autofocus required :placeholder="$t('document.tags_new')" :disabled="updatingTags" autocomplete="off" />
        </b-input-group>
        <selectable-dropdown :items="tags" @input="tag = $event" @click.native="addTag" :hide="!tags.length"></selectable-dropdown>
      </b-form>
    </div>
    <div class="col-md-8" v-if="displayTags">
      <ul class="document-tags-form list-unstyled mb-0 mt-1">
        <li class="document-tags-form__tag badge badge-light border badge-pill mr-2 mb-1" v-for="tag in document.tags" :key="tag">
          {{ tag }}
          <confirm-button :confirmed="() => deleteTag(tag)" :label="$t('document.tag_confirmation')" class="document-tags-form__tag__delete btn btn-sm">
            <fa icon="times" class="fa-fw" />
          </confirm-button>
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

      &__delete.btn {
        line-height: 1;
        border: 0;
        font-size: 0.9rem;
        color: $text-muted;
        cursor: pointer;
        padding: 0;

        &:hover {
          color: $danger;
        }
      }
    }
  }
</style>
