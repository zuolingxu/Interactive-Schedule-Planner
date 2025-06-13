<template>
  <div class="schedule-form">
    <div class="form-container">
      <h2>{{ isEditMode ? "修改日程" : "新建日程" }}</h2>
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
      if (this.isEditMode) {
        // 编辑模式：发送 PUT 请求
        this.$emit("update-event", this.formData);
      } else {
        // 新建模式：发送 POST 请求
        this.$emit("create-event", this.formData);
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
.schedule-form {
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

.form-container {
  width: 300px;
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
select,
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