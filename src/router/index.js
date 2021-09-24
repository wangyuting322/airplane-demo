import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
]

const router = new VueRouter({
  routes,
  base: process.env.VUE_APP_BASE,
  mode: process.env.VUE_APP_MODE, 

})

export default router
