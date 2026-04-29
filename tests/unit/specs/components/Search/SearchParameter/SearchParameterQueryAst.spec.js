import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchParameterQueryAst from '@/components/Search/SearchParameter/SearchParameterQueryAst'
import { useAppStore } from '@/store/modules'
import { SEARCH_OPERATORS } from '@/enums/searchOperators'

describe('SearchParameterQueryAst.vue', () => {
  let plugins, appStore

  beforeEach(() => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    appStore = useAppStore()
  })

  function mountAst(ast) {
    return mount(SearchParameterQueryAst, {
      props: { ast },
      global: { plugins }
    })
  }

  const term = (value) => ({ field: '<implicit>', term: value })

  describe('operator display', () => {
    it('shows OR operator between terms when ast.operator is implicit and store defaults to OR', () => {
      const ast = { left: term('foo'), operator: '<implicit>', right: term('bar') }
      const wrapper = mountAst(ast)
      expect(wrapper.text()).toContain('OR')
    })

    it('shows AND operator between terms when ast.operator is implicit and store is set to AND', () => {
      appStore.setSettings('search', 'searchOperator', SEARCH_OPERATORS.AND)
      const ast = { left: term('foo'), operator: '<implicit>', right: term('bar') }
      const wrapper = mountAst(ast)
      expect(wrapper.text()).toContain('AND')
    })

    it('shows explicit AND operator regardless of store setting', () => {
      appStore.setSettings('search', 'searchOperator', SEARCH_OPERATORS.OR)
      const ast = { left: term('foo'), operator: 'AND', right: term('bar') }
      const wrapper = mountAst(ast)
      expect(wrapper.text()).toContain('AND')
    })

    it('shows explicit OR operator regardless of store setting', () => {
      appStore.setSettings('search', 'searchOperator', SEARCH_OPERATORS.AND)
      const ast = { left: term('foo'), operator: 'OR', right: term('bar') }
      const wrapper = mountAst(ast)
      expect(wrapper.text()).toContain('OR')
    })
  })
})
