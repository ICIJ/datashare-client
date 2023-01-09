<template>
  <v-wait for="load thread">
    <fa icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-5" slot="waiting"></fa>
    <div class="document-thread p-0" v-if="document">
      <ul class="list-unstyled document-thread__list m-0">
        <li
          class="document-thread__list__email"
          :class="{ 'document-thread__list__email--active': isActive(email) }"
          :key="email.id"
          v-for="email in thread.hits"
        >
          <router-link :to="{ name: 'document', params: email.routerParams }" class="px-3 py-2 d-block" v-once>
            <div class="d-flex text-nowrap">
              <div class="w-100">
                <email-string
                  class="document-thread__list__email__from mr-3"
                  :email="email.messageFrom"
                  tag="strong"
                ></email-string>
              </div>
              <abbr
                class="document-thread__list__email__date align-self-end small"
                :title="email.creationDateHuman"
                v-b-tooltip
                v-if="email.creationDate"
              >
                {{ $d(email.creationDate) }}
              </abbr>
            </div>
            <div class="d-flex">
              <span class="document-thread__list__email__to text-muted mr-3" v-if="isActive(email) && email.messageTo">
                {{ $t('email.to') }}
                <ul class="list-inline d-inline">
                  <email-string
                    class="list-inline-item"
                    :email="to"
                    :key="to"
                    tag="li"
                    v-for="to in email.messageTo.split(',')"
                  ></email-string>
                </ul>
              </span>
              <span class="document-thread__list__email__excerpt text-muted w-100" v-else>
                {{ email.excerpt }}
              </span>
            </div>
          </router-link>
          <div v-if="isActive(email)">
            <document-translated-content
              class="document-thread__list__email__content"
              :document="activeDocument"
              :named-entities="namedEntities"
            ></document-translated-content>
          </div>
        </li>
      </ul>
    </div>
  </v-wait>
</template>

<script>
import { findIndex, reduce } from 'lodash'
import bodybuilder from 'bodybuilder'

import elasticsearch from '@/api/elasticsearch'
import EsDocList from '@/api/resources/EsDocList'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'
import EmailString from '@/components/EmailString'

/**
 * Display a document's thread (for emails)
 */
export default {
  name: 'DocumentThread',
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    },
    /**
     * A list of named entities to forward to the document content component
     */
    namedEntities: {
      type: Array,
      default: () => []
    }
  },
  components: {
    DocumentTranslatedContent,
    EmailString
  },
  data() {
    return {
      thread: {
        hits: []
      },
      threadQueryFields: {
        threadIndex: 'metadata.tika_metadata_message_raw_header_thread_index',
        messageId: 'metadata.tika_metadata_message_raw_header_message_id'
      }
    }
  },
  computed: {
    activeDocument: {
      // Document's content is not a reactive property yet, so we cannot use
      // vue caching mechanism to ensure the activeDocument computed property is
      // refreshed after the content was updated.
      cache: false,
      get() {
        return this.document
      }
    },
    activeDocumentIndex() {
      return findIndex(this.thread.hits, this.isActive)
    },
    threadBody() {
      const body = bodybuilder()
      // Creation date is the date when the email was sent
      body.sort('metadata.tika_metadata_dcterms_created', 'asc')
      body.rawOption('highlight', {
        fields: {
          content: {
            no_match_size: 280
          }
        }
      })
      // Select only the Documents and not the NamedEntities
      body.query('match', 'type', 'Document')
      // Select only the Documents at the same extraction level
      body.query('match', 'extractionLevel', this.document.extractionLevel)
      // Select emails only
      body.query('bool', (b) =>
        b.orQuery('match', 'contentType', 'application/vnd.ms-outlook').orQuery('regexp', 'contentType', 'message/.*')
      )
      // Similar subject
      body.query('query_string', {
        fields: ['metadata.tika_metadata_dc_subject', 'metadata.tika_metadata_subject'],
        query: `.*\"${this.document.cleanSubject}\".*`
      })
      // Collect all field data
      return reduce(
        this.threadQueryFields,
        (body, path, field) => {
          const value = this.document[field]
          if (value) body.query('match', path, value)
          return body
        },
        body
      )
    }
  },
  methods: {
    isActive(email) {
      return email.id === this.document.id
    },
    async scrollToActive() {
      // Element must be mounted
      await this.$nextTick()
      // Use the active email
      let element = this.$el.querySelector('.document-thread__list__email--active')
      // For the first email, we go to the top of the page
      if (this.activeDocumentIndex === 0) element = this.$el
      // Get the offset from the navbar height (which is sticky)
      const offset = -parseInt(this.$root.$el.style.getPropertyValue('--search-document-navbar-height'))
      // Use the scroll-tracker component
      const $container = this.$el.closest('.overflow-auto')
      this.$root.$emit('scroll-tracker:request', element, offset, $container)
    },
    async init() {
      this.$wait.start('load thread')
      // Load it's thread (if any)
      this.thread = await this.getThread()
      this.thread.push('hits.hits', this.document.raw)
      this.thread.removeDuplicates()
      this.thread.orderBy('creationDate', ['asc'])
      this.$wait.end('load thread')
      // Scroll to the active email
      await this.scrollToActive()
    },
    async getThread() {
      try {
        if (this.threadBody) {
          const raw = await elasticsearch.search({
            _source_excludes: 'content,content_translated',
            index: this.document.index,
            body: this.threadBody.build()
          })
          return new EsDocList(raw)
        }
        return EsDocList.none()
      } catch (_) {
        return EsDocList.none()
      }
    }
  },
  beforeRouteEnter(_to, _from, next) {
    next(this.init)
  },
  beforeRouteUpdate(_to, _from, next) {
    this.init().then(next)
  },
  mounted() {
    this.$store.subscribe(({ type, payload }) => {
      if (type === 'document/content') {
        this.thread.hits[this.activeDocumentIndex].content = payload
      }
    })
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.document-thread {
  background: black;
  margin: $spacer;

  &__list {
    background: white;
    border: 1px solid $border-color;
    border-bottom: 0;
    margin: 0;
    padding: 0;

    &__email {
      border-bottom: 1px solid $border-color;

      & > a {
        color: $body-color;

        &:hover {
          text-decoration: none;
        }
      }

      &--active {
        position: relative;

        &:before {
          border-left: 2px solid $secondary;
          bottom: 0;
          box-shadow: 0 0 10px 0 $secondary;
          content: '';
          left: 0;
          position: absolute;
          top: 0;
        }
      }

      &__to {
        .list-inline-item:not(:last-of-type):after {
          clear: right;
          content: ',';
          float: right;
        }
      }
    }
  }
}
</style>
