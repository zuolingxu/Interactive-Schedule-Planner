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
app.use(store);s
app.mount('#app')

// 也许下面是为了打包为exe用的？ 没看懂 -by wx
// const { app, BrowserWindow } = require('electron')

// const createWindow = () => {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600
//   })

  // win.loadFile('index.html')

  // 下面的url为自己启动vite项目的url。
  // win.loadURL('http://127.0.0.1:5173/')
  // 打开electron的开发者工具
  // win.webContents.openDevTools({ mode: 'detach' })
// }

// app.whenReady().then(() => {
//   createWindow()
//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow()
//   })
// })

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })
