<template>
  <div class="user-history">
    <div class="container mt-4">
      <ul class="list-unstyled user-history__list card mb-4" v-if="events.length">
        <li v-for="event in events" :key="event.id" class="user-history__list__item">
          <router-link :to="{ path: `/${event.uri}` }" class="p-2 d-block d-flex">
            <div>
              <div class="user-history__list__item__name font-weight-bold">
                {{ event.name }}
              </div>
              <div class="user-history__list__item__query ml-auto small">
                <div v-for="obj in objectFromURI(event.uri)" :key="obj[0]" style="display:inline">
                  {{ obj[0] }}
                  {{ obj[1] }}
                </div>
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
export default {
  props: {
    events: {
      type: Array
    }
  },
  methods: {
    objectFromURI (uri) {
      return new URLSearchParams(uri).entries()
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

        &__query {
          color: $text-muted;
          width: 800px;
          min-width: 800px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
</style>
