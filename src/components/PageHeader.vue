<template>
  <div class="page-header bg-white">
    <div class="container py-5">
      <h3 class="page-header__title">
        <page-icon :icon="icon" v-if="icon"></page-icon>
        {{ title }}
      </h3>
      <div class="page-header__description">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script>
import PageIcon from '@/components/PageIcon'

/**
 * The header to display on top of every page
 */
export default {
  name: 'PageHeader',
  components: {
    PageIcon
  },
  props: {
    /**
     * The description of the page as subtitle
     */
    description: {
      type: String,
      default: 'Description'
    },
    /**
     * A FortAwesome definition object
     */
    icon: {
      type: String,
      default: null
    },
    /**
     * The title of the page
     */
    title: {
      type: String,
      default: 'Title'
    }
  }
}
</script>
