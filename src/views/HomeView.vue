<template>
  <div class="home">
    <h1>交互式日程规划系统</h1>
    <p>请选择功能：</p>
    <div class="nav-buttons">
      <button @click="goTo('/focus')">进入专注模式</button>
      <button @click="goTo('/schedule')">查看日程</button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const goTo = (path) => router.push(path)

    return { goTo }
  }
}
</script>

<style scoped>
.home {
  text-align: center;
  padding: 60px;
}
.nav-buttons {
  margin-top: 30px;
}
button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
}
</style>
