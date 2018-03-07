import Vue from 'vue'
import Router from 'vue-router'

import App from '@/components/App'
import Document from '@/components/Document'
import Search from '@/components/Search'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: App,
      children: [
        {
          name: 'search',
          path: '',
          component: Search,
          // Copy all query parameters to component's props
          props: (route) => route.query
        },
        {
          name: 'document',
          path: 'd/:_id/',
          component: Document,
          props: true
        }
      ]
    }
  ]
})
