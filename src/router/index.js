import Vue from 'vue'
import Router from 'vue-router'
import App from '@/components/App'
import Search from '@/components/Search'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: App,
      children: [
        {
          path: '',
          name: 'search',
          component: Search,
          // Copy all query parameters to component's props
          props: (route) => route.query
        }
      ]
    }
  ]
})
