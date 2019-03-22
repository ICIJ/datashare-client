<template>
  <div class="user-history">
    <div class="container">
      <div class="user-history__header p-3">
        <button class="btn btn-sm btn-outline-secondary float-right" @click="clear" v-if="documents.length">
          <fa icon="trash-alt" class="mr-1" />
          {{ $t('userHistory.clear') }}
        </button>
        <h4 class="h5">
          {{ $t('userHistory.heading') }}
        </h4>
        <p v-if="documents.length" class="m-0">
          {{ $t('userHistory.description') }}
        </p>
        <p v-else class="text-muted m-0">
          {{ $t('userHistory.empty') }}
        </p>
      </div>
      <ul class="list-unstyled user-history__list px-3 pb-4" v-if="documents.length">
        <li v-for="(document, i) in documents" :key="i" class="user-history__list__item">
          <router-link :to="{ name: 'document', params: document.routerParams }" class="p-2 text-white d-block">
            <div class="font-weight-bold">
              <document-sliced-name :document="document" />
            </div>
            <div class="user-history__list__item__location ml-auto small">
              <fa icon="folder" class="mr-1" />
              {{ document.location }}
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import reverse from 'lodash/reverse'
import DocumentSlicedName from '@/components/DocumentSlicedName'

export default {
  components: {
    DocumentSlicedName
  },
  computed: {
    documents () {
      return reverse(this.$store.getters['userHistory/getDocuments']())
    }
  },
  methods: {
    clear () {
      this.$store.commit('userHistory/clear')
    }
  }
}
</script>

<style lang="scss">
  .user-history {
    color: white;
    font-size: 0.8rem;
    background: #222;
    max-height: 60vh;
    overflow: auto;
    position: relative;

    &__header {
      z-index: 100;
      background: #222;
      position: sticky;
      top:0;
    }

    &__list {

      &__item {

        &:nth-child(odd) {
          background: rgba(white, .1)
        }

        a:hover {
          text-decoration: none;
          background: $secondary;
          color: white;
        }

        &__location {
          color: rgba(white, .6);
        }
      }
    }
  }
</style>
