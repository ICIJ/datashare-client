<template>
  <div class="route-doc">
    <page-header icon="book" :title="meta.title" :description="meta.description"></page-header>
    <div class="container py-4">
      <div class="route-doc__content card card-body" v-html="html"></div>
    </div>
  </div>
</template>

<script>
import docs from '@/mixins/docs'
import PageHeader from '@/components/PageHeader'

export default {
  name: 'RouteDoc',
  components: {
    PageHeader
  },
  mixins: [docs],
  props: {
    slug: {
      type: String
    }
  },
  data () {
    return {
      html: null
    }
  },
  computed: {
    meta () {
      return this.findRouteDocMetaBySlug(this.slug)
    }
  },
  mounted () {
    this.fetch()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => vm.fetch(to.params.slug))
  },
  async beforeRouteUpdate (to, from, next) {
    await this.fetch(to.params.slug)
    next()
  },
  methods: {
    async fetch (slug = this.slug) {
      const { resourcePath } = this.findRouteDocMetaBySlug(slug)
      const module = await import(/* webpackChunkName: "[request]" */ '../../public/docs/' + resourcePath)
      this.html = module.default
    }
  }
}
</script>

<style lang="scss">
  .route-doc {
    min-height: 100vh;

    &__header {
      &__description {
        max-width: 880px;
      }
    }

    &__content {

      & > h1 {
        display: none;
      }

      h2 { @include font-size($h2-font-size * .8); }
      h3 { @include font-size($h3-font-size * .8); }
      h4 { @include font-size($h4-font-size * .8); }
      h5 { @include font-size($h5-font-size * .8); }
      h6 { @include font-size($h6-font-size * .8); }

      img  {
        display: block;
        max-height: 60vh;
        max-width: 750px;
        width: auto;

        @media (max-width: 1370px) {
          max-width: 100%;
        }
      }

      blockquote {
        background-color: $gray-100;
        margin-bottom: $spacer;
        padding: 1rem;

        *:last-of-type {
          margin-bottom: 0;
        }

        pre {
          background-color: transparent;
          border: 0;
          margin-bottom: 0;
          margin-top: 0;
          padding: 0;

          code {
            @include font-size(inherit);
            color: $gray-900; // Effectively the base text color
          }
        }
      }
    }
  }
</style>
