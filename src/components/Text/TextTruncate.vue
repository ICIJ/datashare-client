<template>
  <div>
    {{ displayText }} <span v-if="isTruncated">...</span
    ><b-button v-if="shouldShowSeeMoreButton" variant="link" class="py-0 px-1 align-baseline" @click="toggleSeeMore">
      {{ isExpanded ? seeLess : seeMore }}
    </b-button>
  </div>
</template>

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
  }
})
const { t } = useI18n()
const seeLess = t('textTruncate.seeLess')
const seeMore = t('textTruncate.seeMore')
const isExpanded = ref(false)

const truncateText = (text, truncateLength) => {
  if (text.length <= truncateLength) {
    return text
  }

  const truncatedText = text.slice(0, truncateLength)
  const lastSpaceIndex = truncatedText.lastIndexOf(' ')

  return lastSpaceIndex === -1 ? '' : truncatedText.slice(0, lastSpaceIndex)
}

const displayText = computed(() => {
  return isExpanded.value ? props.text : truncateText(props.text, props.truncateLength)
})

const isTruncated = computed(() => {
  return !isExpanded.value && props.text.length > props.truncateLength
})

const shouldShowSeeMoreButton = computed(() => {
  return props.text.length > props.truncateLength
})

const toggleSeeMore = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped></style>
