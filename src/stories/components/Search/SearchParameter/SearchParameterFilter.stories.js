import SearchParameterFilter from '@/components/Search/SearchParameter/SearchParameterFilter'

export default {
  decorators: [],
  title: 'Components/Search/SearchParameter/SearchParameterFilter',
  component: SearchParameterFilter,
  tags: ['autodocs'],
  args: {
    name: 'path',
    value: '/vault/luxleaks/importantfolder/',
    icon: 'tree-structure',
    color: null
  }
}

export const Default = {}

export const UnknownFilter = {
  args: {
    name: 'hipsDontLie',
    value: 'Shakira',
    icon: 'music-notes',
    color: '#a50000'
  }
}
