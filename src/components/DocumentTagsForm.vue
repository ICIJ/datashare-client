<script>
import bodybuilder from 'bodybuilder'
import esClient from '@/api/esClient'
import settings from '@/utils/settings'
import moment from 'moment'
import castArray from 'lodash/castArray'
import delay from 'lodash/delay'
import get from 'lodash/get'
import map from 'lodash/map'
import throttle from 'lodash/throttle'

export default {
  name: 'DocumentTagsForm',
  props: {
    document: [Object, Array],
    tags: Array,
    displayTags: Boolean
  },
  data () {
    return {
      tag: '',
      existingTags: [],
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
      this.$set(this, 'existingTags', map(buckets, 'key'))
    }, 200),
    async addTag () {
      this.$set(this, 'updatingTags', true)
      await this.$store.dispatch('document/tag', { documents: this.documents, tag: this.tag })
      this.$set(this, 'tag', '')
      this.$set(this, 'existingTags', [])
      this.$set(this, 'updatingTags', false)
      delay(facetName => this.$root.$emit('facet::refresh', facetName), settings.waitForEsAnswer, 'tags')
      // Feedback only when we are not display tags
      if (!this.displayTags) this.$bvToast.toast(this.$t('document.tagged'), { noCloseButton: true, variant: 'success' })
    },
    async deleteTag (tag) {
      this.$set(this, 'updatingTags', true)
      await this.$store.dispatch('document/deleteTag', { documents: this.documents, tag })
      this.$set(this, 'updatingTags', false)
      delay(facetName => this.$root.$emit('facet::refresh', facetName), settings.waitForEsAnswer, 'tags')
    },
    generateTagTooltip (tag) {
      return `${this.$t('document.created_by')} ${tag.user.id} ${this.$t('document.on')} ${moment(tag.creationDate).format('LLL')}`
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
        <selectable-dropdown :items="existingTags" @input="tag = $event" @click.native="addTag" :hide="!existingTags.length"></selectable-dropdown>
      </b-form>
    </div>
    <div class="col-md-8" v-if="displayTags">
      <ul class="document-tags-form__tags list-unstyled mb-0 mt-1">
        <li class="document-tags-form__tags__tag badge badge-light border badge-pill mr-2 mb-1" v-for="tag in tags" :key="tag.label">
          <span :title="generateTagTooltip(tag)" v-b-tooltip>{{ tag.label }}</span>
          <confirm-button :confirmed="() => deleteTag(tag)" :label="$t('document.tag_confirmation')" class="document-tags-form__tags__tag__delete btn btn-sm">
            <fa icon="times" class="fa-fw" />
          </confirm-button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
  .document-tags-form__tags  {
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
