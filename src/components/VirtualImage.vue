<script>

import {checkReminder, checkPlan, randomReminder} from "@/components/Reminder";
import store from "@/store/index.js";

export default {
  name: 'Live2DWidget',
  props: {
    live2dPath: {
     type: String,
     default: '/src/components/live2d-widget/',
    }
  },
  methods: {
   loadExternalResource(url, type) {
    return new Promise((resolve, reject) => {
      let tag;

      if (type === 'css') {
        tag = document.createElement('link');
        tag.rel = 'stylesheet';
        tag.href = url;
      } else if (type === 'js') {
        tag = document.createElement('script');
        tag.type = 'module';
        tag.src = url;
      }

      if (tag) {
        tag.onload = () => resolve(url);
        tag.onerror = () => reject(url);
        document.head.appendChild(tag);
      }
    });
   },
   async initLive2D() {
     const OriginalImage = window.Image;
     window.Image = function (...args) {
       const img = new OriginalImage(...args);
       img.crossOrigin = 'anonymous';
       return img;
     };
     window.Image.prototype = OriginalImage.prototype;

     await Promise.all([
       this.loadExternalResource(this.live2dPath + 'waifu.css', 'css'),
       this.loadExternalResource(this.live2dPath + 'waifu-tips.js', 'js'),
     ]);
     console.log('Live2D Widget resources loaded successfully');
     const instances = await initWidget({
       modelPath: '/src/assets/models/22',
       modelSetting: 'index.json',
       cubism2Path: this.live2dPath + 'live2d.min.js',
       cubism5Path: 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
       tools: ['hitokoto', 'asteroids', 'switch-model', 'switch-texture', 'photo', 'info', 'quit'],
       drag: true,
     });
     console.log('Live2D Widget resources loaded successfully');

     // // example of changeTool API
     // window.changeTool(instances.ToolsManager, 1313, {
     //   name: "tester",
     //   icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>',
     //   callback: async () => { }
     // });

     const svg_path = '/src/assets/';
     const chat_icon = await fetch(svg_path + 'chat.svg').then(response => response.text());
     const calendar_icon = await fetch(svg_path + 'calendar.svg').then(response => response.text());
     const add_icon = await fetch(svg_path + 'add.svg').then(response => response.text());
     const home_icon = await fetch(svg_path + 'home.svg').then(response => response.text());

     window.changeTool(instances.ToolsManager, 0,{
       name: "Home",
       icon: home_icon,
       callback: async () => {
         this.$router.push('/');
       }
     });

     window.changeTool(instances.ToolsManager, 2,{
       name: "Chat",
       icon: chat_icon,
       callback: async () => {
          const message = await randomReminder();
          if (message) {
            window.showMessage(message, 5000, 10, true);
          } else {
            window.showMessage('没有可用的随机消息', 5000, 10, true);
          }
       }
     })

     window.changeTool(instances.ToolsManager, 3,{
       name: "nearestPlan",
       icon: calendar_icon,
       callback: async () => {
     if (store.getters.userId == null) {
       window.showMessage('请先登录以查看日程', 5000, 10, true);
       return;
     }
          const plan = await checkPlan();
          if (plan) {
            window.showMessage(`最近的日程: ${plan}`, 5000, 10, true);
          } else {
            window.showMessage('没有最近的日程', 5000, 0, true);
          }
       }
     });

     console.log('Live2DTool changed successfully');

     // example of showMessage API
     window.showMessage('欢迎来到日程助手!',5000,0,true);

     setInterval(() => {
       checkReminder("Default reminder message");
     }, 6000);
   },
  },
  mounted() {
   this.initLive2D();
  },
};
</script>
