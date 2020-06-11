<template>
  <div class="widget widget--list-group">
    <div class="widget__header" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0 h"></h4>
    </div>
    <div class="list-group widget__list" :class="{ 'list-group-flush': widget.card }">
      <component class="list-group-item list-group-item-action widget__list__item" :is="item | itemComponent" :href="item.href" v-for="(item, i) in items" :key="i" :class="{ active: item.active }" :target="item | itemTarget">
        <div class="widget__list__item__label">
          {{ item.label }}
        </div>
        <div class="widget__list__item__description" v-if="item.description">
          {{ item.description }}
        </div>
      </component>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

/**
 * Widget to display a list of items or links on the insights page.
 */
export default {
  name: 'WidgetListGroup',
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    }
  },
  data () {
    return {
      items: []
    }
  },
  filters: {
    itemComponent ({ href = null } = {}) {
      return href ? 'a' : 'div'
    },
    itemTarget ({ href = null } = {}) {
      const origin = window.location.origin
      return !href || href.indexOf(origin) === 0 ? null : '_blank'
    }
  },
  async mounted () {
    this.items = await this.applyPipelineChain(this.widget.pipeline)(this.widget.items)
  },
  computed: {
    ...mapGetters('pipelines', {
      applyPipelineChain: 'applyPipelineChainByCategory'
    })
  }
}
</script>

<style lang="scss" scoped>
  .widget {
    &--list-group {
      min-height: 100%;
    }

    &__list {

      &__item {

        color: $body-color;

        &[href] {
          color: $link-color;
        }

        &__label {
          color: inherit;
        }

        &__description {
          color: $text-muted;
          font-size: 0.8em;
        }
      }
    }
  }
</style>
