<template>
  <div class="document-actions-group d-flex align-items-center" :class="{'flex-column': vertical}">
    <b-form-checkbox class="m-2" v-if="selectMode" :model-value="selected" @update:modelValue="$emit('update:selected',$event)" name="checkbox"/>
    <slot name="actions" v-bind="{document}">
      <document-actions-group-entry icon="star" :label="$t('documentActionsGroup.star')" @click="clickStar" :tooltip-placement="tooltipPlacement" :is-filled="isStarred"/>
      <document-actions-group-entry icon="share" :label="$t('documentActionsGroup.share')" @click="clickShare" :tooltip-placement="tooltipPlacement"/>
      <document-actions-group-entry icon="download" :label="$t('documentActionsGroup.download')" :disabled="isDownloadAllowed" @click="clickDownload"  :tooltip-placement="tooltipPlacement" />
      <document-actions-group-entry icon="arrows-out-simple" :label="$t('documentActionsGroup.expand')" @click="clickExpand" :tooltipPlacement="tooltipPlacement"/>
    </slot>
  </div>
   
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
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
  },
  /**
   * True if selectMode is allowed
   */
   selectMode: {
    type: Boolean
  },
  /**
   * True if checkbox is selected
   */
   selected: {
    type: Boolean
  }
})

const { t } = useI18n()

const emit = defineEmits(['click-star','click-download','click-share','click-expand','update:selected'])

const clickStar = () => {
  emit("click-star", {id:document.id})
}
const clickDownload = () => {
  emit("click-download", {id:document.id})
}
const clickShare = () => {
  emit("click-share", {id:document.id})
}
const clickExpand = () => {
  emit("click-expand", {id:document.id})
}

</script>

