<template>
  <div class="auth-modal">
    <div class="modal-container">
      <h2 class="modal-title">请先注册或登录</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="formData.username"
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            type="password"
            v-model="formData.password"
            placeholder="请输入密码"
          />
        </div>
        <button type="submit">{{ isLoginMode ? '登录' : '注册' }}</button>
        <button type="button" @click="toggleMode">
          {{ isLoginMode ? '切换到注册' : '切换到登录' }}
        </button>
        <button type="button" @click="closeModal">取消</button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import backendService from '@/services/BackendService';

export default {
  name: 'AuthModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false // 控制弹窗是否显示
    }
  },
  data() {
    return {
      isLoginMode: true, // 默认登录模式
      formData: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    ...mapActions(['login']), // 映射 Vuex 的 login 方法
    async handleSubmit() {
      try {
        if (this.isLoginMode) {
          const response = await backendService.login(this.formData)
          this.login(response.user_id) // 更新全局登录状态
          this.$emit('login-success', response.user_id) // 通知父组件
          this.closeModal()
        } else {
          await backendService.register(this.formData)
          alert('注册成功！')
          this.isLoginMode = true // 切换到登录模式
        }
      } catch (error) {
        alert(error.message)
      }
    },
    toggleMode() {
      this.isLoginMode = !this.isLoginMode
    },
    closeModal() {
      window.showMessage('先注册再使用哦！', 5000,1,true);
      this.$emit('close-modal')
    },
  }
}
</script>

<style scoped>
.auth-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.modal-container {
  width: 300px;
}

.modal-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
button {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  cursor: pointer;
}

button[type='submit'] {
  background-color: #2196f3;
  color: white;
}

button[type='button'] {
  background-color: #f44336;
  color: white;
}
</style>