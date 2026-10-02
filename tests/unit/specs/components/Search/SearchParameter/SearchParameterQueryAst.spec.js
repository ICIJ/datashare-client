import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchParameterQueryAst from '@/components/Search/SearchParameter/SearchParameterQueryAst'
import SearchParameterQueryTerm from '@/components/Search/SearchParameter/SearchParameterQueryTerm'
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

  const term = value => ({ field: '<implicit>', term: value })

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

  describe('lock click forwarding (icij/datashare#2332)', () => {
    // Emitted directly on the nested SearchParameterQueryTerm rather than
    // clicked through the DOM: its own click handling is already covered by
    // SearchParameterQueryTerm.spec.js, this only tests whether the AST
    // wiring itself re-emits click:lock up to the caller.
    it('re-emits click:lock from a leaf filter chip', () => {
      const ast = { field: 'contentType', term: 'application/pdf' }
      const wrapper = mount(SearchParameterQueryAst, {
        props: { ast, locked: true, lockLabel: 'Unlock' },
        global: { plugins }
      })

      wrapper.findComponent(SearchParameterQueryTerm).vm.$emit('click:lock')

      expect(wrapper.emitted('click:lock')).toHaveLength(1)
    })

    it('re-emits click:lock up through a nested AST (left-hand recursion)', () => {
      // lucene nests left-associatively, so a chain like "a AND b AND c" puts
      // the common case on the left branch, not the right one above.
      const ast = { left: { field: 'contentType', term: 'application/pdf' }, operator: '<implicit>', right: term('foo') }
      const wrapper = mount(SearchParameterQueryAst, {
        props: { ast, locked: true, lockLabel: 'Unlock' },
        global: { plugins }
      })

      const termComponents = wrapper.findAllComponents(SearchParameterQueryTerm)
      termComponents[0].vm.$emit('click:lock')

      expect(wrapper.emitted('click:lock')).toHaveLength(1)
    })

    it('re-emits click:lock up through a nested AST (right-hand recursion)', () => {
      const ast = { left: term('foo'), operator: '<implicit>', right: { field: 'contentType', term: 'application/pdf' } }
      const wrapper = mount(SearchParameterQueryAst, {
        props: { ast, locked: true, lockLabel: 'Unlock' },
        global: { plugins }
      })

      // Two chips render here: the left, plain (never-lockable) term "foo",
      // and the right, lockable filter chip - the lock click comes from the
      // latter, the last SearchParameterQueryTerm in document order.
      const termComponents = wrapper.findAllComponents(SearchParameterQueryTerm)
      termComponents[termComponents.length - 1].vm.$emit('click:lock')

      expect(wrapper.emitted('click:lock')).toHaveLength(1)
    })
  })
})
