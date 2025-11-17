import { vueRouter } from 'storybook-vue3-router'

import BatchSearchCardDetails from '@/components/BatchSearch/BatchSeachCard/BatchSearchCardDetails'
import { withPinia } from '~storybook/decorators/pinia'

const routes = [
  {
    path: '/project/:name',
    name: 'project.view'
  },
  {
    path: '/:indices/:uuid',
    name: 'batch-tasks.view.results'
  }
]
export default {
  decorators: [vueRouter(routes), withPinia()],
  title: 'Components/BatchSearch/BatchSearchCardDetails',
  component: BatchSearchCardDetails,
  tags: ['autodocs'],
  args: {
    uuid: 'abd',
    nbResults: 7,
    nbQueriesWithoutResults: 5,
    nbQueries: 6,
    name: 'Richest people in the EU',
    status: 'success',
    date: new Date(),
    author: 'jsmith',
    visibility: true,
    phraseMatch: true,
    proximity: 1,
    fuzziness: 2,
    projects: ['banana papers', 'citrus confidential'],
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque malesuada ex egestas sem fringilla euismod. Curabitur cursus mattis lectus, a dignissim libero mattis dapibus. Nulla at lectus imperdiet, sollicitudin nunc ut, consectetur sapien. Morbi fermentum dolor ac ultrices commodo. Sed dictum posuere lobortis. Suspendisse hendrerit elit at convallis suscipit. Nullam non massa eu eros tempor varius id id dolor. Vestibulum eu sagittis arcu, nec sagittis turpis. Donec maximus aliquet tortor, a blandit ligula laoreet eu. In quis est sed urna lacinia sagittis ut ac lectus. Morbi ut ipsum et libero dignissim pretium eu ut diam. Vestibulum ante ips'
  }
}
export const Default = {}
