<template>
  <div class="schedule-form">
    <div class="form-container">
      <!-- 动态标题 -->
      <h2 class="form-title">{{ isEditMode ? "修改日程" : "新建日程" }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="event-name">事件名称</label>
          <input
            type="text"
            id="event-name"
            v-model="formData.event_name"
            required
            placeholder="请输入事件名称"
          />
        </div>
        <div class="form-group">
          <label for="time">时间</label>
          <input
            type="datetime-local"
            id="time"
            v-model="formData.time"
            required
          />
        </div>
        <div class="form-group">
          <label for="priority">重要性</label>
          <select id="priority" v-model="formData.priority">
            <option value="1">重要</option>
            <option value="2">不重要</option>
            <option value="3">懒得干</option>
          </select>
        </div>
        <div class="form-group">
          <label for="tags">标签</label>
          <input
            type="text"
            id="tags"
            v-model="formData.tags"
            placeholder="请输入标签（可选）"
          />
        </div>
        <button type="submit">{{ isEditMode ? "保存修改" : "创建日程" }}</button>
        <button type="button" @click="closeForm">取消</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "ScheduleForm",
  props: {
    isEditMode: {
      type: Boolean,
      default: false, // 是否为编辑模式
    },
    initialData: {
      type: Object,
      default: () => ({
        event_name: "",
        time: "",
        priority: "2", // 默认重要性为中
        tags: "",
      }),
    },
  },
  data() {
    return {
      formData: {
        event_name: "",
        time: this.getDefaultTime(), // 默认时间为今天
        priority: "2", // 默认重要性为中
        tags: "",
      },
    };
  },
  methods: {
    getDefaultTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    handleSubmit() {
      const eventData = {
        ...this.formData,
        time: this.formData.time, // 使用 local 时间
      };

      if (this.isEditMode) {
        this.$emit("update-event", eventData);
      } else {
        this.$emit("create-event", eventData);
      }
      this.closeForm();
    },
    closeForm() {
      this.$emit("close-form");
    },
  },
};
</script>

<style scoped>
/* 表单容器样式 */
.schedule-form {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  z-index: 1000;
}

.form-container {
  background-color: #fdf6e3; /* 纸黄色背景 */
  border-radius: 12px; /* 圆角 */
  padding: 20px;
  width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* 阴影效果 */
}

.form-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input,
select,
button {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

button {
  cursor: pointer;
}

button[type="submit"] {
  background-color: #4caf50;
  color: white;
  border: none;
}

button[type="button"] {
  background-color: #f44336;
  color: white;
  border: none;
}
</style>