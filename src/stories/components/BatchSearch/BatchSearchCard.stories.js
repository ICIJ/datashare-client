import { vueRouter } from 'storybook-vue3-router'

import BatchSearchCard from '@/components/BatchSearch/BatchSearchCard'
import { storeDecoratorPipelineChainByCategory } from '~storybook/decorators/vuex'
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
const batchSearch = {
  uuid: 'aabc',
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
const batchSearchNoResults = {
  uuid: 'aabc',
  nbResults: 0,
  nbQueriesWithoutResults: 0,
  nbQueries: 6,
  name: 'Richest people in the EU',
  status: 'success',
  date: new Date(),
  author: 'jsmith',
  visibility: true,
  phraseMatch: false,
  proximity: 1,
  fuzziness: 2,
  projects: ['banana papers', 'citrus confidential'],
  description: 'Lorem ipsum dolor sit id doante ips'
}
export default {
  decorators: [vueRouter(routes), storeDecoratorPipelineChainByCategory],
  title: 'Components/BatchSearch/BatchSearchCard',
  component: BatchSearchCard,
  tags: ['autodocs'],
  args: {
    batchSearch
  }
}
export const Default = {}
export const NoResults = {
  args: {
    batchSearch: batchSearchNoResults
  }
}
