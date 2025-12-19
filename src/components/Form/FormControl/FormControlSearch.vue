<script setup>
import { computed, toRef, useTemplateRef, watch } from 'vue'
import { ButtonIcon } from '@icij/murmur-next'
import PhosphorIcon from '@/components/PhosphorIcon.vue'
import { useI18n } from 'vue-i18n'

import { buttonSizeValidator, SIZE } from '@/enums/sizes'

/**
 * A search input with pill layout.
 */
defineOptions({
  name: 'FormControlSearch'
})

/**
 * Input value
 * @model
 */
const modelValue = defineModel({
  type: [String, Number]
})
const { t } = useI18n()
const props = defineProps({
  /**
   * Optional placeholder text
   */
  placeholder: {
    type: String
  },
  /**
   * Hide the magnifying glass icon
   */
  noIcon: {
    type: Boolean
  },
  /**
   * Icon name in the start slot
   */
  iconName: {
    type: [String, Object, Array],
    default: () => PhMagnifyingGlass
  },
  /**
   * Add clear text option
   */
  clearText: {
    type: Boolean
  },
  /**
   * Set the autofocus on the search bar on load
   */
  autofocus: {
    type: Boolean,
    default: false
  },
  /**
   * Change the state of the input to "loading" (with a spinner)
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * Search input size (sm, md, lg)
   */
  size: {
    type: String,
    default: SIZE.MD,
    validator: buttonSizeValidator
  },
  /**
   * Disable autocomplete by default.
   */
  autocomplete: {
    type: String,
    default: 'off'
  },
  /**
   * Add light shadow around the form input
   */
  shadow: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'focus', 'up', 'down', 'input', 'enter', 'blur', 'clear'])

const hideClearInput = computed(() => !modelValue.value)
const icon = computed(() => (props.loading ? PhCircleNotch : props.iconName))
const target = useTemplateRef('target')
const focus = () => target.value?.focus()
const blur = () => target.value?.blur()

function setInput(value = '') {
  modelValue.value = value
  emit('input', value)
}

function clearInput() {
  focus()
  setInput()
  emit('clear')
}

const classList = computed(() => {
  return {
    'form-control-search--shadow': props.shadow,
    'form-control-search--hide-clear': hideClearInput.value,
    [`form-control-search--${props.size}`]: !!props.size
  }
})
const placeholder = computed(() => props.placeholder ?? t('formControlSearch.placeholder'))
watch(toRef(props, 'autofocus'), autofocus => autofocus && focus())

defineExpose({ focus, blur, clear: clearInput })
</script>

<template>
  <form
    class="form-control-search"
    :class="classList"
    @submit.prevent="emit('submit', modelValue)"
  >
    <div class="form-control-search__input-group input-group flex-nowrap">
      <span class="form-control-search__start input-group-text border-end-0">
        <slot
          name="input-start"
          v-bind="{ loading, icon, noIcon }"
        >
          <phosphor-icon
            v-if="!noIcon"
            :name="icon"
            square
            :spin="loading"
          />
        </slot>
      </span>
      <b-form-input
        ref="target"
        :size="size"
        :model-value="modelValue"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        class="form-control-search__input border-start-0 border-end-0 mx-0 px-0"
        :placeholder="placeholder"
        @keydown.up="emit('up', $event)"
        @keydown.down="emit('down', $event)"
        @keydown.enter="emit('enter', $event)"
        @keydown.esc="blur"
        @update:model-value="setInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />
      <span class="form-control-search__end input-group-text px-1 py-0 border-start-0">
        <button-icon
          v-if="clearText"
          icon-left="x"
          hide-label
          variant="outline-secondary"
          :size="size"
          class="form-control-search__clear__icon p-1 mx-1 border-0"
          @click="clearInput()"
        />
        <slot
          name="input-end"
          v-bind="{ loading, clearText }"
        />
      </span>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.form-control-search {
  border-radius: 6px;

  &__start,
  &__end {
    background-color: var(--bs-body-bg);
    color: $secondary;
    transition: $input-transition;
    min-width: var(--bs-border-radius);
  }

  &__input:focus,
  &__input:hover {
    border: 0;
    box-shadow: none;
  }

  &__input-group:has(&__input:focus),
  &__input-group:has(&__input:hover) {
    box-shadow: none;

    .form-control-search__start {
      border-left: 1px solid $input-focus-border-color;
      border-top: 1px solid $input-focus-border-color;
      border-bottom: 1px solid $input-focus-border-color;
    }
    .form-control-search__input {
      border-top: 1px solid $input-focus-border-color;
      border-bottom: 1px solid $input-focus-border-color;
    }
    .form-control-search__end {
      border-right: 1px solid $input-focus-border-color;
      border-top: 1px solid $input-focus-border-color;
      border-bottom: 1px solid $input-focus-border-color;
    }
  }

  &--hide-clear &__clear__icon {
    visibility: hidden;
  }

  &--shadow {
    box-shadow: var(--bs-box-shadow-lg);
  }

  &--shadow.form-control-search--sm {
    box-shadow: var(--bs-box-shadow);
  }

  .form-control-lg {
    padding: 1em;
  }
}
</style>
