import { createRouter, createWebHistory } from 'vue-router'

// 导入视图组件
import HomeView from '../views/HomeView.vue'
import ScheduleView from '../views/ScheduleView.vue'
import FocusView from '../views/FocusView.vue'
import NotFound from '../views/NotFound.vue'

// 定义路由表
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: ScheduleView
  },
  {
    path: '/focus',
    name: 'Focus',
    component: FocusView
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
