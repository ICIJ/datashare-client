<template>
  <div class="email-view" v-if="document && isReady">
    <h3 class="p-3">
      {{ document.cleanSubject }}
    </h3>
    <ul class="list-unstyled email-view__thread m-0">
      <li v-for="email in thread.hits" :key="email.id" class="email-view__thread__item" :class="{ 'email-view__thread__item--active': isActive(email) }">
        <router-link :to="{ name: 'email', params: routeParams(email) }" class="px-3 py-2 d-block" v-once>
          <div class="d-flex text-nowrap">
            <div class="w-100">
              <strong class="email-view__thread__item__from mr-3">
                {{ email.messageFrom }}
              </strong>
            </div>
            <abbr class="email-view__thread__item__date align-self-end small" :title="email.creationDateHuman" v-b-tooltip>
              {{ $d(email.creationDate) }}
            </abbr>
          </div>
          <div class="d-flex">
            <span class="email-view__thread__item__to text-muted text-nowrap mr-3" v-if="isActive(email)">
              to {{ email.messageTo }}
            </span>
            <span class="email-view__thread__item__excerpt text-muted w-100" v-else>
              {{ email.excerpt }}
            </span>
          </div>
        </router-link>
        <div v-if="isActive(email)" v-once>
          <div  class="email-view__thread__item__content p-3" v-html="email.contentHtml"></div>
          <div  class="email-view__thread__item__footer px-4 py-3 bg-light d-flex">
            <router-link :to="{ name: 'document', params: routeParams(email) }" class="align-self-end">
              See detail
            </router-link>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
  .email-view {

    &__thread {
      border-top: 1px solid $border-color;
      overflow: hidden;
      background: white;
      padding: 0;
      margin: 0;

      &__item {
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
            border-left: 3px solid $secondary;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            box-shadow: 0 0 10px 0 $secondary;
          }
        }
      }
    }
  }
</style>

<script>
import findIndex from 'lodash/findIndex'
import reduce from 'lodash/reduce'
import { mapState } from 'vuex'
import bodybuilder from 'bodybuilder'
import VueScrollTo from 'vue-scrollto'

import esClient from '@/api/esClient'
import Response from '@/api/Response'

export default {
  name: 'EmailView',
  props: ['index', 'id', 'routing'],
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
    ...mapState('document', {
      document: 'doc'
    }),
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
    routeParams (email) {
      return { id: email.id, index: email.index, routing: email.routing }
    },
    async scrollToActive () {
      // Element must be mounted
      await this.$nextTick()
      // For the first email, we go to the top of the page
      if (this.activeDocumentIndex === 0) return VueScrollTo.scrollTo({ y: 0 })
      // Get the offset from the navbar height (which is sticky)
      const offset = -parseInt(this.$root.$el.style.getPropertyValue('--search-document-navbar-height'))
      // Scroll to the active item with a slight offset
      VueScrollTo.scrollTo(this.$el.querySelector('.email-view__thread__item--active'), { offset })
    },
    async getDoc (params = { id: this.id, routing: this.routing, index: this.index }) {
      this.isReady = false
      // Load the current document)
      await this.$store.dispatch('document/get', params)
      // Load it's thread (if any)
      this.thread = await this.getThread()
      this.thread.push('hits.hits', this.document.raw)
      this.thread.removeDuplicates()
      this.thread.orderBy('creationDate', ['asc'])
      this.isReady = true
      // Add the document to the user's history
      await this.$store.commit('userHistory/addDocument', this.document)
      // Scroll to the active doc
      this.scrollToActive()
    },
    async getThread () {
      try {
        if (this.threadBody) {
          const raw = await esClient.search({
            index: this.index,
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
  beforeRouteEnter (to, _from, next) {
    next(vm => vm.getDoc(to.params))
  },
  beforeRouteUpdate (to, _from, next) {
    this.getDoc(to.params).then(next)
  }
}
</script>
