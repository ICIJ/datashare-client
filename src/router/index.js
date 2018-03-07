import Vue from 'vue'
import Router from 'vue-router'

import App from '@/components/App'
import Doc from '@/components/Doc'
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
          name: 'doc',
          path: 'doc/:_id/',
          component: Doc,
          props: true
        }
      ]
    }
  ]
})
