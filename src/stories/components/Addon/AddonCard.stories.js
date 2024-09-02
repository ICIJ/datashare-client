import AddonCard from '@/components/Addon/AddonCard'

export default {
  tags: ['autodocs'],
  title: 'Components/Addon/AddonCard',
  component: AddonCard,
  args: {
    title: 'Data connect',
    version: null,
    recommendedVersion: '1.2.3',
    url: 'https://github.com/ICIJ/datashare-plugin-dataconnect',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tempor porttitor turpis, vel porttitor nunc faucibus nec. Fusce eu laoreet elit, ac fermentum odio. Nunc feugiat a velit eu vulputate. Nulla vitae malesuada urna. In a massa sed ex tempus sollicitudin ac sed lacus. Praesent eleifend purus sed auctor congue. Aenean felis augue, interdum sit amet auctor a, egestas '
  }
}

export const Default = {}
export const Installed = {
  args: { version: '1.2.3' }
}
export const Update = {
  args: { version: '1.2.3', recommendedVersion: '1.2.34' }
}
