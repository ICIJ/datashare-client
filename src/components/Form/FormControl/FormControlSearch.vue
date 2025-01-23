<script setup>
import { computed, ref } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { PhCircleNotch, PhMagnifyingGlass } from '@phosphor-icons/vue'

import { buttonSizeValidator, SIZE } from '@/enums/sizes'
import ButtonIcon from '@/components/Button/ButtonIcon'
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
   * Round the border of the input
   */
  rounded: {
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

const emit = defineEmits(['submit', 'up', 'down', 'update:modelValue', 'input', 'enter', 'blur'])

const showClearText = computed(() => {
  return props.modelValue?.length > 0
})

function input(value) {
  modelValue.value = value
  emit('input', value)
}

const target = ref(null)

function focus() {
  target.value?.querySelector('.form-control-search__input').focus()
}

function clearInputText() {
  focus()
  input('')
}

const icon = computed(() => {
  return props.loading ? PhCircleNotch : props.iconName
})

const classList = computed(() => {
  return {
    'form-control-search--shadow': props.shadow,
    [`form-control-search--${props.size}`]: true
  }
})

defineExpose({
  focus
})
</script>

<template>
  <form class="form-control-search" :class="classList" @submit.prevent="emit('submit', modelValue)">
    <div class="form-control-search__input-group input-group">
      <span
        class="form-control-search__start input-group-text border-end-0"
        :class="{ 'form-control-search--rounded--start': rounded }"
      >
        <slot name="input-start" v-bind="{ loading, icon, noIcon }">
          <phosphor-icon v-if="!noIcon" :name="icon" square :spin="loading" />
        </slot>
      </span>
      <b-form-input
        :size="size"
        :model-value="modelValue"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        class="form-control-search__input border-start-0 border-end-0 mx-0 px-0"
        :class="{
          'form-control-search__input--no-icon': noIcon,
          'form-control-search__input--no-clear-text': noIcon,
          'form-control-search--rounded--start': rounded && noIcon,
          'form-control-search--rounded--end': rounded && !clearText
        }"
        :placeholder="placeholder"
        @keydown.up="emit('up', $event)"
        @keydown.down="emit('down', $event)"
        @keydown.enter="emit('enter', $event)"
        @keydown.esc="$event.target.blur()"
        @update:modelValue="input"
        @blur="emit('blur', $event)"
      />
      <span
        class="form-control-search__end input-group-text px-1 py-0 border-start-0"
        :class="{ 'form-control-search--rounded--end': rounded }"
      >
        <button-icon
          v-if="clearText"
          icon-left="x"
          hide-label
          variant="outline-secondary"
          :size="size"
          class="form-control-search__clear__icon p-1 mx-1 border-0"
          :class="{
            'form-control-search__clear__icon--hide': !showClearText
          }"
          @click="clearInputText()"
        />
        <slot name="input-end" v-bind="{ loading, clearText }"></slot>
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

  &--rounded {
    &--start {
      border-bottom-left-radius: $border-radius-pill;
      border-top-left-radius: $border-radius-pill;
    }
    &--end {
      border-bottom-right-radius: $border-radius-pill;
      border-top-right-radius: $border-radius-pill;
    }
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

  &__clear__icon {
    &--hide {
      visibility: hidden;
    }
  }

  .form-control-lg {
    padding: 1em;
  }

  &--shadow {
    box-shadow: var(--bs-box-shadow-lg);
  }

  &--shadow.form-control-search--sm {
    box-shadow: var(--bs-box-shadow);
  }
}
</style>
