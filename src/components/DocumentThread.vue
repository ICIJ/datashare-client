<template>
  <div class="document-thread p-0" v-if="document && isReady">
    <ul class="list-unstyled document-thread__list m-0">
      <li v-for="email in thread.hits" :key="email.id" class="document-thread__list__email" :class="{ 'document-thread__list__email--active': isActive(email) }">
        <router-link :to="{ name: 'document', params: email.routerParams }" class="px-3 py-2 d-block" v-once>
          <div class="d-flex text-nowrap">
            <div class="w-100">
              <email-string class="document-thread__list__email__from mr-3" :email="email.messageFrom" tag="strong" />
            </div>
            <abbr class="document-thread__list__email__date align-self-end small" :title="email.creationDateHuman" v-if="email.creationDate" v-b-tooltip>
              {{ $d(email.creationDate) }}
            </abbr>
          </div>
          <div class="d-flex">
            <span class="document-thread__list__email__to text-muted mr-3" v-if="isActive(email) && email.messageTo">
              {{ $t('email.to') }}
              <ul class="list-inline d-inline">
                <email-string v-for="to in email.messageTo.split(',')" :email="to" :key="to" tag="li" class="list-inline-item" />
              </ul>
            </span>
            <span class="document-thread__list__email__excerpt text-muted w-100" v-else>
              {{ email.excerpt }}
            </span>
          </div>
        </router-link>
        <div v-if="isActive(email)">
          <document-translated-content class="document-thread__list__email__content" :document="email" :named-entities="namedEntities" />
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
  .document-thread {
    background: black;
    margin:$spacer;

    &__list {
      border: 1px solid $border-color;
      border-bottom: 0;
      background: white;
      padding: 0;
      margin: 0;

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
            content: "";
            border-left: 2px solid $secondary;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            box-shadow: 0 0 10px 0 $secondary;
          }
        }

        &__to {
          .list-inline-item:not(:last-of-type):after {
            content:",";
            float: right;
            clear: right;
          }
        }
      }
    }
  }
</style>

<script>
import findIndex from 'lodash/findIndex'
import reduce from 'lodash/reduce'
import bodybuilder from 'bodybuilder'

import esClient from '@/api/esClient'
import Response from '@/api/resources/Response'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent.vue'
import EmailString from '@/components/EmailString.vue'

export default {
  name: 'DocumentThread',
  props: {
    document: {
      type: Object
    },
    namedEntities: {
      type: Array,
      default: () => ([])
    }
  },
  components: {
    DocumentTranslatedContent,
    EmailString
  },
  data () {
    return {
      isReady: false,
      thread: { hits: [] },
      threadQueryFields: {
        threadIndex: 'metadata.tika_metadata_message_raw_header_thread_index',
        messageId: 'metadata.tika_metadata_message_raw_header_message_id'
      }
    }
  },
  computed: {
    activeDocumentIndex () {
      return findIndex(this.thread.hits, this.isActive)
    },
    threadBody () {
      const body = bodybuilder()
      // Select only the Documents and not the NamedEntities
      body.query('match', 'type', 'Document')
      // Select only the Documents at the same extraction level
      body.query('match', 'extractionLevel', this.document.extractionLevel)
      // Similar subject
      body.query('match', 'metadata.tika_metadata_subject', `.*${this.document.cleanSubject}.*`)
      // Collect all field data
      return reduce(this.threadQueryFields, (body, path, field) => {
        const value = this.document[field]
        if (value) body.query('match', path, value)
        return body
      }, body)
    }
  },
  methods: {
    isActive (email) {
      return email.id === this.document.id
    },
    async scrollToActive () {
      // Element must be mounted
      await this.$nextTick()
      // Use the active email
      let element = this.$el.querySelector('.document-thread__list__email--active')
      // For the first email, we go to the top of the page
      if (this.activeDocumentIndex === 0) element = this.$el
      // Get the offset from the navbar height (which is sticky)
      const offset = -parseInt(this.$root.$el.style.getPropertyValue('--search-document-navbar-height'))
      // Use the scroll-tracker component
      const $container = this.$el.closest('.ps-container')
      this.$root.$emit('scroll-tracker:request', element, offset, $container)
    },
    async init () {
      this.isReady = false
      // Load it's thread (if any)
      this.thread = await this.getThread()
      this.thread.push('hits.hits', this.document.raw)
      this.thread.removeDuplicates()
      this.thread.orderBy('creationDate', ['asc'])
      this.isReady = true
      // Add the document to the user's history
      await this.$store.commit('userHistory/addDocument', this.document)
      // Scroll to the active email
      await this.scrollToActive()
    },
    async getThread () {
      try {
        if (this.threadBody) {
          const raw = await esClient.search({
            index: this.document.index,
            type: 'doc',
            body: this.threadBody.sort('metadata.tika_metadata_meta_creation_date', 'asc').build()
          })
          return new Response(raw)
        }
        return Response.none()
      } catch (e) {
        return Response.none()
      }
    }
  },
  beforeRouteEnter (_to, _from, next) {
    next(this.init)
  },
  beforeRouteUpdate (_to, _from, next) {
    this.init().then(next)
  },
  mounted () {
    this.init()
  }
}
</script>
