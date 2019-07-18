<script>
export default {
  name: 'DocumentTagsForm',
  props: {
    document: {
      type: Object
    }
  },
  data () {
    return {
      tag: '',
      updatingTags: false
    }
  },
  methods: {
    async addTag () {
      this.updatingTags = true
      await this.$store.dispatch('document/tag', { documentId: this.document.id, routingId: this.document.routing, tags: [this.tag] })
      await this.$store.dispatch('document/refresh')
      this.tag = ''
      this.updatingTags = false
    },
    async deleteTag (tag) {
      this.updatingTags = true
      await this.$store.dispatch('document/untag', { documentId: this.document.id, routingId: this.document.routing, tags: [tag] })
      await this.$store.dispatch('document/refresh')
      this.updatingTags = false
    }
  }
}
</script>

<template>
  <div class="document-tags-form row mb-3">
    <div class="col-md-4 mb-3">
      <b-form @submit.prevent="addTag" class="document-tags-form__add">
        <b-form-input id="new-tag" size="sm" v-model="tag" autofocus required placeholder="Add a new tag" :disabled="updatingTags" />
      </b-form>
    </div>
    <div class="col-md-8">
      <ul class="document-tags-form list-unstyled mb-0 mt-1">
        <li class="document-tags-form__tag badge badge-light border badge-pill mr-2 mb-1" v-for="tag in document.tags" :key="tag">
          {{ tag }}
          <fa icon="times" class="document-tags-form__tag__delete fa-fw" @click="deleteTag(tag)" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
  .document-tags-form  {
    font-size: 1rem;
    cursor: pointer;

    &__delete {
      font-size: 0.9rem;
      color: $text-muted;

      &:hover {
        color: $danger;
      }
    }
  }
</style>
