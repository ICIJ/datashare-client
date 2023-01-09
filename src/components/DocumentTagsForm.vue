<template>
  <div class="document-tags-form row no-gutters">
    <div :class="{ 'col-md-4 mb-3': displayTags }" class="d-flex" v-if="displayForm">
      <b-form @submit.prevent="addTag" class="document-tags-form__add">
        <b-overlay :show="!isReady" spinner-small class="h-100">
          <b-input-group size="sm" class="h-100">
            <b-input-group-text slot="prepend">
              <fa icon="tag"></fa>
            </b-input-group-text>
            <b-form-input
              v-model="tag"
              @input="searchTags"
              required
              :placeholder="$t('document.tagsNew')"
              autocomplete="off"
              autofocus
              ref="tag"
            ></b-form-input>
          </b-input-group>
        </b-overlay>
        <selectable-dropdown
          :items="suggestions"
          @input="tag = $event"
          @click.native="addTag"
          :hide="!suggestions.length"
          class="document-tags-form__add__suggestions"
        ></selectable-dropdown>
      </b-form>
    </div>
    <div class="col-md-8" v-if="displayTags">
      <ul class="document-tags-form__tags list-unstyled mb-0 mt-1">
        <li
          class="document-tags-form__tags__tag badge badge-pill mr-2 mb-1"
          :class="[mode === 'light' ? 'border badge-light' : 'badge-dark']"
          v-for="tag in tags"
          :key="tag.label"
        >
          <span :title="generateTagTooltip(tag)" v-b-tooltip>
            {{ tag.label }}
          </span>
          <confirm-button
            class="document-tags-form__tags__tag__delete btn btn-sm"
            :class="mode"
            :confirmed="() => deleteTag(tag)"
            v-if="!isCreatedByAdmin(tag)"
            :label="$t('document.tagConfirmation')"
            :no="$t('global.no')"
            :yes="$t('global.yes')"
          >
            <fa icon="times" class="fa-fw pl-2"></fa>
          </confirm-button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import castArray from 'lodash/castArray'
import delay from 'lodash/delay'
import get from 'lodash/get'
import map from 'lodash/map'
import throttle from 'lodash/throttle'
import bodybuilder from 'bodybuilder'
import moment from 'moment'

import elasticsearch from '@/api/elasticsearch'
import displayUser from '@/filters/displayUser'
import settings from '@/utils/settings'

/**
 * A small form to add tags to one or several documents.
 */
export default {
  name: 'DocumentTagsForm',
  props: {
    /**
     * The selected document(s)
     */
    document: {
      type: [Object, Array]
    },
    /**
     * List of existing tags for the selection
     */
    tags: {
      type: Array
    },
    /**
     * Display the list of tags
     */
    displayTags: {
      type: Boolean
    },
    /**
     * Display the form
     */
    displayForm: {
      type: Boolean
    },
    /**
     * Form display mode
     */
    mode: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
      isReady: true,
      suggestions: [],
      tag: ''
    }
  },
  computed: {
    documents() {
      return castArray(this.document)
    }
  },
  methods: {
    searchTags: throttle(async function (value = '') {
      if (value.length < 1) return
      const index = get(this.documents, '0.index', null)
      const include = `.*${value.toLowerCase()}.*`
      const body = bodybuilder().size(0).agg('terms', 'tags', { include }).build()
      const response = await elasticsearch.search({ index, body })
      const buckets = get(response, 'aggregations.agg_terms_tags.buckets', [])
      this.$set(this, 'suggestions', map(buckets, 'key'))
    }, 200),
    async addTag() {
      this.$set(this, 'isReady', false)
      await this.$store.dispatch('document/tag', {
        documents: this.documents,
        tag: this.tag,
        userId: await this.$core.auth.getUsername()
      })
      this.$set(this, 'tag', '')
      this.$set(this, 'suggestions', [])
      this.$set(this, 'isReady', true)
      delay(
        (filterName) => this.$root.$emit('filter::refresh', filterName),
        settings.elasticsearch.waitForAnswer,
        'tags'
      )
      if (!this.displayTags)
        this.$bvToast.toast(this.$t('document.tagged'), { noCloseButton: true, variant: 'success' })
      // Focus on the tag input
      if (this.$refs && this.$refs.tag && this.$refs.tag.focus) {
        this.$nextTick(() => {
          this.$refs.tag.focus()
        })
      }
    },
    async deleteTag(tag) {
      this.$set(this, 'isReady', false)
      await this.$store.dispatch('document/deleteTag', { documents: this.documents, tag })
      this.$root.$emit('filter::delete', 'tags', tag)
      this.$set(this, 'isReady', true)
    },
    generateTagTooltip(tag) {
      return `${this.$t('document.createdBy')} ${displayUser(tag.user.id)} ${this.$t('document.on')} ${moment(
        tag.creationDate
      ).format('LLL')}`
    },
    isCreatedByAdmin(tag) {
      return tag?.user?.id === this.$config.get('userAdmin') || false
    }
  }
}
</script>

<style lang="scss" scoped>
.document-tags-form {
  font-size: 1rem;

  &__add {
    position: relative;

    &__suggestions.selectable-dropdown.dropdown-menu {
      position: absolute;
      right: 0;
      top: 100%;
    }
  }

  &__tags__tag {
    span {
      vertical-align: middle;
    }

    &__delete.btn {
      border: 0;
      cursor: pointer;
      font-size: 0.8rem;
      line-height: 1;
      padding: 0;

      &.dark {
        color: white;
      }

      &.light {
        color: $text-muted;
      }

      > svg:hover {
        color: $danger;
      }
    }
  }
}
</style>
