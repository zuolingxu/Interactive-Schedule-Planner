import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from "./store";

import Particles from '@tsparticles/vue3'
import { loadFull } from 'tsparticles'

import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

const app = createApp(App)

// 初始化 tsparticles 插件
app.use(Particles, {
  init: async (engine) => {
    await loadFull(engine) // 加载完整的 tsparticles 引擎
  }
})

app.use(router)
app.use(store);
app.mount('#app')
