<template>
  <b-button-group class="document-actions align-items-center" :vertical="vertical" size="sm">
    <slot name="selection" v-bind="{document}">

    </slot>
    <slot name="actions" v-bind="{document}">
      <document-actions-group-entry icon-name="star" label="Star" @click="clickStar" :tooltipPlacement="tooltipPlacement" :isFilled="isStarred"/>
      <document-actions-group-entry icon-name="share" label="Share" @click="clickShare" :tooltipPlacement="tooltipPlacement"/>
      <document-actions-group-entry icon-name="download" :disabled="isDownloadAllowed" @click="clickDownload" :label="downloadLabel" :tooltipPlacement="tooltipPlacement" />
      <document-actions-group-entry icon-name="arrows-out-simple"  label="Expand"  @click="clickExpand" :tooltipPlacement="tooltipPlacement"/>
  </slot>
   
  </b-button-group>
</template>

<script setup>
import { findIndex, uniqueId } from 'lodash'
import { mapState, useStore } from 'vuex'
import { FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import RouterLinkPopup from '@/components/RouterLinkPopup'
import DocumentActionsGroupEntry from '@/components/Document/DocumentActionsGroup/DocumentActionsGroupEntry'
defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object
  },
  /**
   * Use a vertical layoutk
   */
  vertical: {
    type: Boolean
  },
  /**
   * Tooltip's placement on each action using Floating UI: https://floating-ui.com/docs/tutorial#placements
   * @values 'auto', 'auto-start', 'auto-end', 'top', 'right', 'bottom', 'left', 'top-start', 'right-start', 'bottom-start', 'left-start', 'top-end', 'right-end', 'bottom-end', 'left-end'
   */
  tooltipPlacement: {
    type: String,
    default: 'top'
  },
  /**
   * True if download is allowed for the document
   */
  isDownloadAllowed: {
    type: Boolean
  },
  /**
   * True if download is allowed for the document
   */
   isStarred: {
    type: Boolean
  }
})

const { t } = useI18n()

const emit = defineEmits(['click-star','click-download','click-share','click-expand'])



async function clickStar() {
  emit("click-star", {id:document.id})
}
async function clickDownload() {
  emit("click-download", {id:document.id})
}
async function clickShare() {
  emit("click-share", {id:document.id})
}
async function clickExpand() {
  emit("click-expand", {id:document.id})
}

</script>

<style lang="scss" scoped>
.document-actions {
  .btn-group {
    .btn:not(:first-of-type) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    .dropdown:last-of-type {
      display: inline-flex;

      &:deep(.btn) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }
}
</style>
