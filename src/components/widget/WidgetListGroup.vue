<template>
  <div class="widget widget--list-group">
    <div v-if="widget.title" class="widget__header" :class="{ 'card-header': widget.card }">
      <h4 class="m-0 h" v-html="widget.title"></h4>
    </div>
    <div class="list-group widget__list" :class="{ 'list-group-flush': widget.card }">
      <component
        :is="item | itemComponent"
        v-for="(item, i) in items"
        :key="i"
        class="list-group-item list-group-item-action widget__list__item"
        :href="item.href"
        :class="{ active: item.active }"
        :target="item | itemTarget"
      >
        <div class="widget__list__item__label">
          {{ item.label }}
        </div>
        <div v-if="item.description" class="widget__list__item__description">
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
  filters: {
    itemComponent({ href = null } = {}) {
      return href ? 'a' : 'div'
    },
    itemTarget({ href = null } = {}) {
      const origin = window.location.origin
      return !href || href.indexOf(origin) === 0 ? null : '_blank'
    }
  },
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    }
  },
  data() {
    return {
      items: []
    }
  },
  computed: {
    ...mapGetters('pipelines', {
      applyPipelineChain: 'applyPipelineChainByCategory'
    })
  },
  async mounted() {
    const items = await this.applyPipelineChain(this.widget.pipeline)(this.widget.items)
    this.$set(this, 'items', items)
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
