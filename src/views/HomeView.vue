<template>
  <div class="home-page">
    <Sidebar :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="content" :class="{ collapsed: isSidebarCollapsed }">
      <ParticleBackground />
      <h1>交互式日程规划系统</h1>
      <p>欢迎使用我们的交互式日程规划系统！</p>
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
      isSidebarCollapsed: false
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }
};
</script>

<style scoped>
.home-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
  color:aliceblue
}

.content.collapsed {
  margin-left: 60px; /* 当侧边栏收起时，内容区域向左移动 */
}

.content:not(.collapsed) {
  margin-left: 200px; /* 当侧边栏展开时，内容区域向左移动 */
}
</style>



