<template>
  <div id="app">
    <router-view />
    <AuthModal
      v-if="showAuthModal"
      :isVisible="showAuthModal"
      @login-success="handleLoginSuccess"
      @close-modal="closeAuthModal"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AuthModal from './components/AuthModal.vue'

export default {
  name: 'App',
  components: {
    AuthModal
  },
  computed: {
    ...mapGetters(['showAuthModal']) // 映射 Vuex 的 showAuthModal 状态
  },
  methods: {
    ...mapActions(['login']),
    handleLoginSuccess(userId) {
      this.login(userId) // 调用 Vuex 的 login 方法
    },
    closeAuthModal() {
      this.$store.commit('setShowAuthModal', false) // 关闭弹窗
    }
  }
}
</script>

<style>
/* 全局样式 */
</style>
