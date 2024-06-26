<template>
  <div class="document-tags-form row no-gutters">
    <div v-if="displayForm" :class="{ 'col-md-4 mb-3': displayTags }" class="d-flex">
      <b-form class="document-tags-form__add" @submit.prevent="addTag">
        <b-overlay :show="!isReady" spinner-small class="h-100">
          <b-input-group size="sm" class="h-100">
            <b-input-group-text slot="prepend">
              <fa icon="tag"></fa>
            </b-input-group-text>
            <b-form-input
              ref="tag"
              v-model="tag"
              required
              :placeholder="$t('document.tagsNew')"
              autocomplete="off"
              autofocus
              @input="searchTags(tag)"
            ></b-form-input>
          </b-input-group>
        </b-overlay>
        <selectable-dropdown
          :items="suggestions"
          :hide="!suggestions.length"
          class="document-tags-form__add__suggestions"
          @update:modelValue="tag = $event"
          @click="addTag"
        ></selectable-dropdown>
      </b-form>
    </div>
    <div v-if="displayTags" class="col-md-8">
      <ul class="document-tags-form__tags list-unstyled mb-0 mt-1">
        <li
          v-for="oneTag in tags"
          :key="oneTag.label"
          class="document-tags-form__tags__tag badge rounded-pill me-2 mb-1"
          :class="[mode === 'light' ? 'border text-bg-light' : 'text-bg-dark']"
        >
          <span v-b-tooltip :title="generateTagTooltip(oneTag)">
            {{ oneTag.label }}
          </span>
          <confirm-button
            v-if="!isCreatedByAdmin(oneTag)"
            class="document-tags-form__tags__tag__delete btn btn-sm"
            :class="mode"
            :confirmed="() => deleteTag(oneTag)"
            :label="$t('document.tagConfirmation')"
            :no="$t('global.no')"
            :yes="$t('global.yes')"
          >
            <fa icon="xmark" class="fa-fw ps-2"></fa>
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

import displayUser from '@/utils/displayUser'
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
      type: [Object, Array],
      default: () => {}
    },
    /**
     * List of existing tags for the selection
     */
    tags: {
      type: Array,
      default: () => []
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
      const index = this?.document?.index
      const include = `.*${value.toLowerCase()}.*`
      const body = bodybuilder().size(0).agg('terms', 'tags', { include }).build()
      const response = await this.$core.api.elasticsearch.search({ index, body })
      const buckets = get(response, 'aggregations.agg_terms_tags.buckets', [])
      this.suggestions = map(buckets, 'key')
    }, 200),
    async addTag() {
      this.isReady = false
      const documents = this.documents
      const tag = this.tag
      const userId = await this.$core.auth.getUsername()
      await this.$store.dispatch('document/tag', { documents, tag, userId })
      this.tag = ''
      this.suggestions = []
      this.isReady = true
      delay((name) => this.$core.emit('filter::refresh', { name }), settings.elasticsearch.waitForAnswer, 'tags')
      if (!this.displayTags) {
        this.$toast.success(this.$t('document.tagged'))
      }
      // Focus on the tag input
      if (this.$refs && this.$refs.tag && this.$refs.tag.focus) {
        this.$nextTick(() => {
          this.$refs.tag.focus()
        })
      }
    },
    async deleteTag(tag) {
      this.isReady = false
      await this.$store.dispatch('document/deleteTag', { documents: this.documents, tag })
      this.$core.emit('filter::delete', { name: 'tags', value: tag })
      this.isReady = true
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
    color: inherit;

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
        color: $body-color;
      }

      > svg:hover {
        color: $danger;
      }
    }
  }
}
</style>
