import BatchSearchCardDetails from '@/components/BatchSearch/BatchSeachCard/BatchSearchCardDetails'

export default {
  title: 'Components/BatchSearch/BatchSearchCardDetails',
  component: BatchSearchCardDetails,
  tags: ['autodocs'],
  args: {
    batchSearch: {
      uuid: 'abd',
      nbResults: 7,
      nbQueriesWithoutResults: 5,
      nbQueries: 6,
      name: 'Richest people in the EU',
      state: 'SUCCESS',
      date: new Date(),
      user: { id: 'jsmith' },
      published: true,
      phraseMatches: true,
      proximity: 1,
      fuzziness: 2,
      projects: ['banana-papers', 'citrus-confidential'],
      uri: '',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque malesuada ex egestas sem fringilla euismod. Curabitur cursus mattis lectus, a dignissim libero mattis dapibus. Nulla at lectus imperdiet, sollicitudin nunc ut, consectetur sapien. Morbi fermentum dolor ac ultrices commodo. Sed dictum posuere lobortis. Suspendisse hendrerit elit at convallis suscipit. Nullam non massa eu eros tempor varius id id dolor. Vestibulum eu sagittis arcu, nec sagittis turpis. Donec maximus aliquet tortor, a blandit ligula laoreet eu. In quis est sed urna lacinia sagittis ut ac lectus. Morbi ut ipsum et libero dignissim pretium eu ut diam. Vestibulum ante ips'
    }
  }
}
export const Default = {}
