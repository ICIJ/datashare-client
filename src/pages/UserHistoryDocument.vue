<template>
  <div class="user-history">
    <div class="container mt-4">
      <ul class="list-unstyled user-history__list card mb-4" v-if="events.length">
        <li v-for="event in events" :key="event.id" class="user-history__list__item">
          <router-link :to="{ path: `/${event.uri}` }" class="p-2 d-block d-flex">
            <document-thumbnail :document="event" size="40" crop lazy class="mr-2 user-history__list__item__preview"></document-thumbnail>
            <div>
              <div class="user-history__list__item__name font-weight-bold">
                {{ event.name }}
              </div>
              <div class="user-history__list__item__uri ml-auto small">
                <fa icon="link" class="mr-1"></fa>
                {{ event.uri }}
              </div>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import DocumentThumbnail from '@/components/DocumentThumbnail'

export default {
  components: {
    DocumentThumbnail
  },
  props: {
    events: {
      type: Array
    }
  }
}
</script>

<style lang="scss">
  .user-history {
    &__list {

      &__item {

        &:nth-child(odd) {
          background: rgba(black, .05)
        }

        a:hover {
          text-decoration: none;
          background: $secondary;
          color: white;
        }

        &__uri {
          color: $text-muted;
          width: 800px;
          min-width: 800px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        & &__preview.document-thumbnail--crop {
          width: 40px;
          min-width: 40px;
          height: 40px;
        }
      }
    }
  }
</style>
