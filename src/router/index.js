import Vue from 'vue'
import VueRouter from 'vue-router'

import App from '@/components/App'
import Document from '@/components/Document'
import Search from '@/components/Search'

Vue.use(VueRouter)

export default new VueRouter({
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
          path: 'd/:id/',
          component: Document,
          props: true
        }
      ]
    }
  ]
})
