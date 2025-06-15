<template>
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <div class="toggle-button" @click="toggleSidebar">
      <span v-if="isCollapsed">☰</span>
      <span v-else><</span>
    </div>
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.name" @click="navigate(item.route)">
        <i :class="item.icon"></i>
        <span v-if="!isCollapsed">{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    isCollapsed: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      navItems: [
        { name: '主页', route: '/', icon: 'fas fa-home' },
        { name: '日程表', route: '/schedule', icon: 'fas fa-calendar-alt' },
        { name: '专注模式', route: '/focus', icon: 'fas fa-bullseye' },
        { name: '小助手', route: '/helper', icon: 'fas fa-hands-helping' },
      ]
    };
  },
  methods: {
    toggleSidebar() {
      this.$emit('toggle');
    },
    navigate(route) {
      this.$router.push(route);
    }
  }
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 150px;
  background-color: #000000;
  color: white;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 左对齐内容 */
}

.sidebar.collapsed {
  width: 60px;
  align-items: center; /* 收起时内容居中 */
}

.toggle-button {
  margin: 10px 10px 10px auto; /* 按钮靠右对齐 */
  cursor: pointer;
  font-size: 24px; /* 增大按钮字体大小 */
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.nav-list li {
  width: 100%;
  padding: 15px; /* 增大导航项的内边距 */
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-list li:hover {
  background-color: #313f4d;
}

.nav-list li i {
  font-size: 24px; /* 增大图标大小 */
  margin-right: 10px;
}

.nav-list li span {
  font-size: 20px; /* 增大文字字体大小 */
  font-family: 'Comic Sans MS', cursive, sans-serif; /* 使用艺术字字体 */
}

.sidebar.collapsed .nav-list li {
  justify-content: center; /* 收起时图标居中对齐 */
  font-size: 26px;
}

.sidebar.collapsed .nav-list li span {
  display: none; /* 收起时隐藏文字 */
}
</style>