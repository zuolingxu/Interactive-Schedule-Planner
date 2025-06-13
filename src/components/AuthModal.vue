<template>
  <div class="auth-modal">
    <div class="modal-container">
      <!-- 标题 -->
      <h2 class="modal-title">请先注册或登录</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
            required
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            required
            placeholder="请输入密码"
          />
        </div>
        <button type="submit">{{ isLoginMode ? "登录" : "注册" }}</button>
        <button type="button" @click="toggleMode">
          {{ isLoginMode ? "切换到注册" : "切换到登录" }}
        </button>
        <button type="button" @click="closeModal">取消</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "AuthModal",
  props: {
    isVisible: {
      type: Boolean,
      default: false, // 控制弹窗是否显示
    },
  },
  data() {
    return {
      isLoginMode: false, // 默认注册模式
      formData: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    handleSubmit() {
      if (this.isLoginMode) {
        // 登录逻辑
        fetch("http://127.0.0.1:5000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.formData),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message === "登录成功！") {
              alert("登录成功！");
              this.$emit("login-success", data.user_id); // 通知父组件登录成功
              this.closeModal(); // 关闭弹窗
            } else {
              alert(data.message);
            }
          })
          .catch((error) => {
            console.error("登录失败：", error);
          });
      } else {
        // 注册逻辑
        fetch("http://127.0.0.1:5000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.formData),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message === "用户注册成功！") {
              alert("注册成功！");
              // 自动登录
              this.autoLogin();
            } else {
              alert(data.message);
            }
          })
          .catch((error) => {
            console.error("注册失败：", error);
          });
      }
    },
    autoLogin() {
      // 自动登录逻辑
      fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "登录成功！") {
            alert("自动登录成功！");
            this.$emit("login-success", data.user_id); // 通知父组件登录成功
            this.closeModal(); // 关闭弹窗
          } else {
            alert("自动登录失败，请手动登录！");
          }
        })
        .catch((error) => {
          console.error("自动登录失败：", error);
        });
    },
    toggleMode() {
      this.isLoginMode = !this.isLoginMode;
    },
    closeModal() {
      this.$emit("close-modal");
    },
  },
};
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

button[type="submit"] {
  background-color: #2196f3;
  color: white;
}

button[type="button"] {
  background-color: #f44336;
  color: white;
}
</style>