import EmptyState from '@/components/EmptyState/EmptyState'
import appBuilding from '@/assets/images/illustrations/app-building.svg'
import appBuildingDark from '@/assets/images/illustrations/app-building-dark.svg'

export default {
  title: 'Components/EmptyState/EmptyState',
  tags: ['autodocs'],
  component: EmptyState,
  args: {
    label: 'Oops, we see no history of visited documents... To read documents, you first need to add some!',
    image: 'https://imgur.com/84B5gki.png',
    imageDark: 'https://imgur.com/ylz9F5G.png',
    imageMaxWidth: '130px',
    actionIcon: 'plus',
    actionHref: 'https://icij.gitbook.io/datashare',
    actionLabel: 'Add documents',
    actionTarget: '_blank',
    actionVariant: 'action'
  }
}

export const Default = {}

export const WithoutAction = {
  args: {
    label: [
      'Oops, you have no entity recognitions...',
      'Want to find entities in your documents?',
      'Use the Plus button on the top right.'
    ].join('\n'),
    image: 'https://imgur.com/mWnO7gd.png',
    imageDark: null,
    actionLabel: null
  }
}

export const UnderConstruction = {
  args: {
    label: 'Our team is still working on this new page.',
    image: appBuilding,
    imageDark: appBuildingDark,
    imageMaxWidth: '200px',
    actionLabel: null
  }
}
