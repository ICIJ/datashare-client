import Vue from 'vue'
import VueRouter from 'vue-router'

import App from '@/components/App'
import DocumentView from '@/components/DocumentView'
import Search from '@/components/Search'

import store from '@/store'

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
          beforeEnter: (to, from, next) => {
            store.dispatch('search/updateFromRouteQuery', to.query)
            next()
          }
        },
        {
          name: 'document',
          path: 'd/:id/:routing?',
          component: DocumentView,
          props: true
        }
      ]
    }
  ]
})
