<template>
  <div class="helper-page">
    <Sidebar :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="content" :class="{ collapsed: isSidebarCollapsed }">
        <ParticleBackground />
      <h1>小助手模块</h1>
      <p>这里是小助手模块的内容，开发者可以在此处添加功能。</p>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import ParticleBackground from '../components/ParticleBackground.vue';


export default {
  name: 'HelperView',
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
.helper-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
  color: aliceblue;
}

.content {
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
}

.content.collapsed {
  margin-left: 60px; /* 当侧边栏收起时，内容区域向左移动 */
}

.content:not(.collapsed) {
  margin-left: 200px; /* 当侧边栏展开时，内容区域向左移动 */
}
</style>