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

     const svg_path = '/src/assets/';
     const chat_icon = await fetch(svg_path + 'chat.svg').then(response => response.text());
     const calendar_icon = await fetch(svg_path + 'calendar.svg').then(response => response.text());
     const add_icon = await fetch(svg_path + 'add.svg').then(response => response.text());


     window.changeTool(instances.ToolsManager, 0,{
       name: "Chat",
       icon: chat_icon,
       callback: async () => {
          const message = await randomReminder();
          if (message) {
            window.showMessage(message, 5000, 1, true);
          } else {
            window.showMessage('没有可用的随机消息', 5000, 1, true);
          }
       }
     })

     window.changeTool(instances.ToolsManager, 2,{
       name: "nearestPlan",
       icon: calendar_icon,
       callback: async () => {
          if (!store.getters.isLoggedIn) {
            window.showMessage('请先登录以查看日程', 5000, 1, true);
            return;
          }
          const plan = await checkPlan();
          if (plan) {
            window.showMessage(`最近的日程:  ${plan}`, 5000, 1, true);
          } else {
            window.showMessage('没有最近的日程', 5000, 1, true);
          }
       }
     });

     window.changeTool(instances.ToolsManager, 3,{
       name: "addPlan",
       icon: add_icon,
       callback: async () => {

       }
     });

     console.log('Live2DTool changed successfully');

     // example of showMessage API
     window.showMessage('欢迎来到日程助手!',5000,1,true);

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
