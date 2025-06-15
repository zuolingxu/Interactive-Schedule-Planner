<template>
  <div class="home-page">
    <Sidebar :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <ParticleBackground />
    <div class="content" :class="{ collapsed: isSidebarCollapsed }">
      <div class="product-name">
        <h1>流光信笺</h1>
      </div>
      <div class="poem-banner">
        <transition name="roll-up" mode="out-in">
          <div :key="currentIndex" class="poem-line">
            <em>{{ displayedPoem }}</em>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import ParticleBackground from '../components/ParticleBackground.vue';

export default {
  name: 'HomeView',
  components: {
    Sidebar,
    ParticleBackground
  },
  data() {
    return {
      isSidebarCollapsed: false,
      poems: [
        "The future belongs to those who believe in the beauty of their dreams.",
        "逝者如斯夫，不舍昼夜。",
        "Every moment is a fresh beginning.",
        "光阴似箭，日月如梭。",
        "Time is the most precious treasure.",
        "Cherish every moment you have.",

      ],
      displayedPoem: '',
      currentIndex: 0,
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    startPoemRotation() {
      setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.poems.length; // 循环切换诗句
        this.displayedPoem = this.poems[this.currentIndex];
      }, 5000);
    }
  },
  mounted() {
    this.displayedPoem = this.poems[this.currentIndex];
    this.startPoemRotation();
  },
};
</script>

<style scoped>
.home-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  position: fixed;
  z-index: 1000;
}

.content {
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
  color: aliceblue;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 修改为从顶部开始 */
  align-items: center;
  text-align: center;
  height: 100%;
  padding-top: 15vh; /* 添加顶部内边距，使内容下移 */
}

@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=ZCOOL+QingKe+HuangYou&family=ZCOOL+XiaoWei&display=swap');
.product-name h1 {
  font-size: 4rem; /* 增大字号 */
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  font-family: 'Ma Shan Zheng', cursive; /* 艺术字体 */
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); /* 添加文字阴影 */
  letter-spacing: 2px; /* 字间距 */
  color: #f8f8ff; /* 更亮的白色 */
}

.poem-banner {
  width: 80%;
  max-width: 800px;
  height: 120px; /* 固定高度 */
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  /* border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2); */
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.poem-line {
  padding: 20px;
  text-align: center;
}

.roll-up-enter-active,
.roll-up-leave-active {
  transition: all 1.5s cubic-bezier(0.645, 0.045, 0.355, 1); /* 更平滑的缓动函数 */
  position: absolute; /* 绝对定位避免布局跳动 */
  width: 100%;
}

.roll-up-enter-from {
  transform: translateY(100%) rotateX(20deg);
  opacity: 0;
}

.roll-up-enter-to {
  transform: translateY(0) rotateX(0);
  opacity: 1;
}

.roll-up-leave-from {
  transform: translateY(0) rotateX(0);
  opacity: 1;
}

.roll-up-leave-to {
  transform: translateY(-100%) rotateX(-20deg);
  opacity: 0;
}

.flip-enter-active {
  transform: translateY(0);
  opacity: 1;
}

.flip-leave-active {
  transform: translateY(-100%);
  opacity: 0;
}

.content.collapsed {
  margin-left: 60px; /* 当侧边栏收起时，内容区域向左移动 */
}

.content:not(.collapsed) {
  margin-left: 200px; /* 当侧边栏展开时，内容区域向左移动 */
}
</style>



