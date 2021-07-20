<template>
  <div class="user-history">
    <div class="container mt-4">
      <ul class="list-unstyled user-history__list card mb-4" v-if="events.length">
        <li v-for="event in events" :key="event.id" class="user-history__list__item">
          <router-link :to="{ path: event.uri }" class="p-3 d-flex">
            <document-thumbnail :document="eventAsDocument(event)" size="40" crop lazy class="mr-3 user-history__list__item__preview" />
            <div class="flex-grow-1">
              <div class="user-history__list__item__name font-weight-bold">
                {{ event.name }}
              </div>
              <div class="user-history__list__item__uri small text-muted" direction="rtl">
                <fa icon="link" class="mr-1" />
                {{ event.uri }}
              </div>
            </div>
          </router-link>
        </li>
      </ul>
      <div class="text-muted text-center" v-else>
        {{  $t('userHistory.empty') }}
      </div>
    </div>
  </div>
</template>

<script>
import { find, trimStart } from 'lodash'
import { pathToRegexp } from 'path-to-regexp'
import DocumentThumbnail from '@/components/DocumentThumbnail'
import Document from '@/api/resources/Document'

export default {
  name: 'UserHistorySaveSearchForm',
  components: {
    DocumentThumbnail
  },
  props: {
    events: {
      type: Array
    }
  },
  methods: {
    eventAsDocument ({ uri }) {
      // Ensure the URI starts with a / and doesn't contain query params
      const path = `/${trimStart(uri.split('?').shift(0), '/')}`
      const [, _index, _id, _routing] = this.documentPathRegexp.exec(path) || []
      return new Document({ _index, _id, _routing })
    }
  },
  computed: {
    documentPathRegexp () {
      const routes = this.$router.getRoutes()
      const { path } = find(routes, { name: 'document-standalone' }) || { }
      return pathToRegexp(path)
    }
  }
}
</script>

<style lang="scss" scoped>
  .user-history {
    &__list {

      &__item {

        &:nth-child(odd) {
          background: $table-accent-bg;
        }

        &:not(:last-of-type) {
          border-bottom: 1px solid $border-color;
        }

        a:hover {
          text-decoration: none;
          color: $table-hover-color;
          background-color: $table-hover-bg;
        }

        & &__preview.document-thumbnail--crop {
          width: 40px;
          min-width: 40px;
          height: 40px;
        }

        a > div {
          min-width: 0;
        }

        &__uri {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
</style>
