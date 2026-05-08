import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/set-password',
      name: 'set-password',
      component: () => import('../views/login/forgetPassword.vue'),
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('../views/login/forgetPassword.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../layout/LoginLayout.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/main/welcome.vue'),
    },
  ],
})

export default router
