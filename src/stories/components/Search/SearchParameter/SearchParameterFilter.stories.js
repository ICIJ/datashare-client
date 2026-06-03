import SearchParameterFilter from '@/components/Search/SearchParameter/SearchParameterFilter'

export default {
  decorators: [],
  title: 'Components/Search/SearchParameter/SearchParameterFilter',
  component: SearchParameterFilter,
  tags: ['autodocs'],
  args: {
    name: 'path',
    value: '/vault/luxleaks/importantfolder/',
    icon: markRaw(IPhTreeStructure),
    color: null
  }
}

export const Default = {}

export const UnknownFilter = {
  args: {
    name: 'hipsDontLie',
    value: 'Shakira',
    icon: markRaw(IPhMusicNotes),
    color: '#a50000'
  }
}
