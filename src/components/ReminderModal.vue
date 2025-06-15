<template>
  <div class="reminder-modal" v-if="isVisible">
    <div class="modal-content">
      <h3>设置提醒</h3>
      <div class="form-group">
        <label>提醒时间：</label>
        <input type="datetime-local" v-model="reminderTime" :min="minTime" />
      </div>
      <div class="form-group">
        <label>提醒内容：</label>
        <input type="text" v-model="reminderMessage" />
      </div>
      <div class="button-group">
        <button @click="setReminder">确认</button>
        <button @click="close">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import { setReminder } from '@/utils/reminder';

export default {
  props: {
    task: {
      type: Object,
      required: true
    },
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      reminderTime: '',
      reminderMessage: ''
    };
  },
  computed: {
    minTime() {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1); // 至少1分钟后
      return now.toISOString().slice(0, 16);
    }
  },
  methods: {
    setReminder() {
      if (!this.reminderTime) {
        window.showMessage('请设置提醒时间', 3000, 1, true);
        return;
      }

      const targetTime = new Date(this.reminderTime);
      const title = '任务提醒';
      const body = this.reminderMessage || `您的任务 "${this.task.event_name}" 即将开始`;

      setReminder(targetTime, title, body);
      window.showMessage('提醒设置成功', 3000, 1, true);
      this.close();
    },
    close() {
      this.$emit('close');
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        // 默认设置为任务开始前30分钟
        const taskTime = new Date(this.task.time);
        taskTime.setMinutes(taskTime.getMinutes() - 30);
        this.reminderTime = taskTime.toISOString().slice(0, 16);
        this.reminderMessage = `您的任务 "${this.task.event_name}" 即将开始`;
      }
    }
  }
};
</script>

<style scoped>
.reminder-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #2c3e50;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.button-group button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button-group button:first-child {
  background-color: #42b983;
  color: white;
}

.button-group button:last-child {
  background-color: #e74c3c;
  color: white;
}
</style>