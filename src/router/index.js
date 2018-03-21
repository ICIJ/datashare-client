import Vue from 'vue'
import VueRouter from 'vue-router'

import App from '@/components/App'
import DocumentView from '@/components/DocumentView'
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
          path: 'd/:id/:tab?',
          component: DocumentView,
          props: true
        }
      ]
    }
  ]
})
