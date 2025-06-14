<script>
export default {
 name: 'Live2DWidget',
 props: {
   live2dPath: {
     type: String,
     default: '/src/components/live2d-widget/dist/',
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


     initWidget({
       waifuPath: this.live2dPath + 'waifu-tips.json',
       // cdnPath: '/src/components/modules/wanko/runtime',
       cdnPath: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/',
       cubism2Path: this.live2dPath + 'live2d.min.js',
       cubism5Path: 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
       tools: ['hitokoto', 'asteroids', 'switch-model', 'switch-texture', 'photo', 'info', 'quit'],
       logLevel: 'warn',
       drag: false,
     });
   },
 },
 mounted() {
   this.initLive2D();
 },
};
</script>
