<template>
  <div class="search-advanced-modal-tag-input">
    <div class="search-advanced-modal-tag-input__container">
      <div v-for="(tag, index) in modelValue" :key="index" class="search-advanced-modal-tag-input__tag">
        <span class="search-advanced-modal-tag-input__tag__text">{{ tag }}</span>
        <button
          type="button"
          class="search-advanced-modal-tag-input__tag__remove"
          :aria-label="t('searchAdvancedModal.removeTag')"
          @click="removeTag(index)"
        >
          <PhX :size="20" />
        </button>
      </div>
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="search-advanced-modal-tag-input__input"
        :placeholder="placeholder"
        @keydown.enter.prevent="addTag"
        @keydown.space.prevent="addTag"
        @keydown.backspace="onBackspace"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhX } from '@phosphor-icons/vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const inputValue = ref('')
const inputRef = ref(null)

function addTag() {
  const value = inputValue.value.trim()
  if (value && !props.modelValue.includes(value)) {
    emit('update:modelValue', [...props.modelValue, value])
    inputValue.value = ''
  }
}

function removeTag(index) {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

function onBackspace() {
  if (inputValue.value === '' && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}
</script>

<style lang="scss" scoped>
.search-advanced-modal-tag-input {
  &__container {
    display: flex;
    flex-wrap: wrap;
    gap: $spacer * 0.5;
    align-items: center;
    padding: $spacer * 0.5;
    border: 1px solid var(--bs-border-color);
    border-radius: $border-radius;
    min-height: 61px;

    &:focus-within {
      border-color: var(--bs-primary);
      outline: 0;
      box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25);
    }
  }

  &__tag {
    display: flex;
    align-items: center;
    gap: $spacer * 0.25;
    padding: $spacer * 0.75 $spacer;
    background-color: var(--bs-gray-200);
    border-radius: $border-radius-sm;
    font-size: $font-size-base;
    line-height: 1.25;

    &__text {
      color: var(--bs-body-color);
    }

    &__remove {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--bs-secondary-color);

      &:hover {
        color: var(--bs-body-color);
      }
    }
  }

  &__input {
    flex: 1;
    min-width: 120px;
    padding: $spacer * 0.5;
    border: none;
    outline: none;
    font-size: $font-size-base;
    background: transparent;

    &::placeholder {
      color: var(--bs-secondary-color);
    }
  }
}
</style>
