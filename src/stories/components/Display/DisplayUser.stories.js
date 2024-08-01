import { identity } from 'lodash'

import { withVuex } from '~storybook/decorators/vuex'
import DisplayUser from '@/components/Display/DisplayUser'

const storeDecorator = withVuex({
  modules: {
    pipelines: {
      namespaced: true,
      getters: {
        applyPipelineChainByCategory() {
          return () => {
            return identity
          }
        }
      }
    }
  }
})

export default {
  title: 'Components/Display/DisplayUser',
  decorators: [storeDecorator],
  tags: ['autodocs'],
  component: DisplayUser,
  args: {
    value: 'batman'
  }
}

export const Default = {}
