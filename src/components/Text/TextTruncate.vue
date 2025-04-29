1
<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  truncateLength: {
    type: Number,
    default: 100
  },
  ellipsis: {
    type: String,
    default: '... '
  }
})

const { t } = useI18n()
const seeLess = computed(() => t('textTruncate.seeLess'))
const seeMore = computed(() => t('textTruncate.seeMore'))
const isExpanded = ref(false)

const toggleSeeMore = () => (isExpanded.value = !isExpanded.value)

const truncatedText = computed(() => props.text.slice(0, props.truncateLength).trimEnd())
const displayText = computed(() => (isExpanded.value ? props.text : truncatedText.value))
const isTruncated = computed(() => !isExpanded.value && props.text.length > props.truncateLength)
const shouldShowSeeMoreButton = computed(() => props.text.length > props.truncateLength)
const seeMoreDisplay = computed(() => (isExpanded.value ? seeLess : seeMore))
</script>

<template>
  <div class="text-truncate-wrapper">
    <span class="text-truncate-wrapper__display">{{ displayText }}</span>
    <span v-if="isTruncated">{{ ellipsis }}</span>
    <b-button
      v-if="shouldShowSeeMoreButton"
      variant="link"
      class="text-reset text-decoration-underline p-0 align-baseline"
      @click="toggleSeeMore"
    >
      {{ seeMoreDisplay }}
    </b-button>
  </div>
</template>
