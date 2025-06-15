import { createRouter, createWebHistory } from 'vue-router'
import store from '../store' // 引入 Vuex，用于检查登录状态

// 导入视图组件
import HomeView from '../views/HomeView.vue'
import ScheduleView from '../views/ScheduleView.vue'
import FocusView from '../views/FocusView.vue'
import NotFound from '../views/NotFound.vue'
import HelperView from '../views/HelperView.vue'; // 新增小助手模块视图

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
    path: '/helper', // 新增小助手模块路由
    name: 'Helper',
    component: HelperView
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

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  if (to.name !== 'Home' && !store.getters.isLoggedIn) {
    store.commit('setShowAuthModal', true) // 设置全局状态以显示注册弹窗
    next({ name: 'Home' }) // 跳转到主页
  } else {
    next() // 继续导航
  }
})

export default router
