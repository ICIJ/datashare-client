import ButtonToggleAdvancedSearch from '@/components/Button/ButtonToggleAdvancedSearch'
import SearchAdvancedModal from '@/components/Search/SearchAdvancedModal/SearchAdvancedModal'

export default {
  title: 'Components/Search/SearchAdvancedModal/SearchAdvancedModal',
  tags: ['autodocs'],
  component: SearchAdvancedModal,
  args: {
    modelValue: false
  },
  render(args) {
    return {
      components: { ButtonToggleAdvancedSearch, SearchAdvancedModal },
      data() {
        return { args }
      },
      methods: {
        onSearch(query) {
          console.log('search', query)
        }
      },
      template: `
        <button-toggle-advanced-search
          :active="args.modelValue"
          @update:active="args.modelValue = $event"
        />
        <search-advanced-modal
          v-bind="args"
          @update:modelValue="args.modelValue = $event"
          @search="onSearch"
        />
      `
    }
  }
}

export const Default = {}
