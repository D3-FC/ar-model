import Vue from 'vue'
import Router from 'vue-router'
import { createRoute } from 'vue-book'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    createRoute({
      requireContext: require.context('./..', true, /.demo.vue$/),
      path: '/demo',
      hideFileExtensions: true
    })
  ]
})
