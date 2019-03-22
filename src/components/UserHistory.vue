<template>
  <div class="user-history">
    <div class="container">
      <div class="user-history__header p-3">
        <h4 class="h5">Your browsing history</h4>
        <p class="m-0">All the documents you opened with Datashare from this computer.</p>
      </div>
      <ul class="list-unstyled user-history__list px-3">
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
