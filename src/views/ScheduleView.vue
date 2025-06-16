<template>
  <div class="schedule-view">
    <Sidebar :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="content" :class="{ collapsed: isSidebarCollapsed }">
      <ParticleBackground />
      <div class="view-controls">
        <label class="square-switch">
          <input type="checkbox" v-model="isDayView" @change="toggleViewMode" />
          <span class="slider">{{ isDayView ? "返回" : "月视图" }}</span>
        </label>
        <button @click="handleCreateEvent">新建日程</button>
        <div v-if="isDayView" class="tag-filter">
          <select v-model="selectedTag" @change="filterTasksByTag">
            <option value="">所有标签</option>
            <option v-for="tag in uniqueTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>
      </div>
      <div v-if="!isDayView">
        <div class="year-controls">
          <button @click="changeYear(-1)"><</button>
          <span>{{ currentYear }} 年</span>
          <button @click="changeYear(1)">></button>
        </div>
        <div class="month-controls">
          <button @click="changeMonth(-1)"><</button>
          <span>{{ currentMonth }} 月</span>
          <button @click="changeMonth(1)">></button>
        </div>
        <div class="weekdays">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>
        <table class="calendar">
          <tbody>
            <tr v-for="week in calendar" :key="week[0].date">
              <td
                v-for="day in week"
                :key="day.date"
                :class="{ 
                  'current-day': isToday(day.date),
                  'other-month': !day.isCurrentMonth
                }"
                @click="viewTasks(day.date)"
              >
                <div>{{ day.date.getDate() }}</div>
                <ul class="tasks">
                  <li v-for="task in day.tasks" :key="task.id">
                    {{ task.event_name }}
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <div class="day-view">
          <h2>{{ selectedDate ? formatDate(selectedDate) : "请选择日期" }}</h2>
          <ul v-if="selectedDate" class="task-list">
            <li v-for="(task, index) in filteredTasks" :key="index" class="task-item">
              <div class="task-time">
                {{ formatTime(task.time) }}
              </div>
              <div class="task-name">
                {{ task.event_name }}
              </div>
              <div class="task-meta">
                <span class="priority">优先级: {{ task.priority }}</span>
                <span class="tags">标签: {{ task.tags }}</span>
              </div>
              <div class="task-actions">
                <button @click="showReminderModal(task)">提醒</button>
                <button @click="editTask(task)">修改</button>
                <button @click="deleteTask(task.id)">删除</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 新建日程表单 -->
      <ScheduleForm
        v-if="isFormVisible"
        :isEditMode="isEditMode"
        :initialData="formData"
        @create-event="createEvent"
        @update-event="updateEvent"
        @close-form="closeForm"
      />
      <!-- 注册或登录弹窗 -->
      <AuthModal
        v-if="isAuthModalVisible"
        @login-success="handleLoginSuccess"
        @close-modal="closeAuthModal"
      />
      <!-- 提醒设置弹窗 -->
      <ReminderModal 
        v-if="showReminder"
        :task="selectedTaskForReminder"
        :isVisible="showReminder"
        @close="closeReminderModal"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Sidebar from "../components/Sidebar.vue";
import ParticleBackground from "../components/ParticleBackground.vue";
import ScheduleForm from "../components/ScheduleForm.vue";
import AuthModal from "../components/AuthModal.vue";
import ReminderModal from '@/components/ReminderModal.vue';
import { requestNotificationPermission } from '@/utils/reminder';
import backendService from '@/services/BackendService';

export default {
  name: "ScheduleView",
  components: {
    Sidebar,
    ParticleBackground,
    ScheduleForm,
    AuthModal,
    ReminderModal,
  },
  data() {
    return {
      isSidebarCollapsed: false,
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      weekDays: ["一", "二", "三", "四", "五", "六", "日"], // 从周一开始
      calendar: [],
      selectedDate: null,
      selectedTasks: [],
      isDayView: false, // 是否为按天展示，默认按月展示
      isFormVisible: false, // 控制表单显示
      isEditMode: false, // 是否为编辑模式
      formData: {}, // 表单初始数据
      isAuthModalVisible: false, // 控制注册或登录弹窗显示
      tasks: {}, // 从后端加载的任务数据
      selectedTag: '', // 当前选中的标签
      uniqueTags: [],  // 存储所有不重复的标签
      showReminder: false,
      selectedTaskForReminder: null,
    };
  },
  computed: {
    ...mapGetters(["isLoggedIn", "userId"]), // 映射 Vuex 的登录状态和用户 ID
    //按时间排序并筛选后的任务
    filteredTasks() {
      let tasks = [...this.selectedTasks];
      
      // 1. 按时间从小到大排序
      tasks.sort((a, b) => new Date(a.time) - new Date(b.time));
      
      // 2. 按标签筛选
      if (this.selectedTag) {
        tasks = tasks.filter(task => 
          task.tags && task.tags.includes(this.selectedTag)
        );
      }
      
      return tasks;
    },
  },
  methods: {
    ...mapActions(["login"]), // 映射 Vuex 的 login 方法
    generateCalendar() {
      const firstDayOfMonth = new Date(this.currentYear, this.currentMonth - 1, 1);
      const lastDayOfMonth = new Date(this.currentYear, this.currentMonth, 0);
      const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
      const daysInMonth = lastDayOfMonth.getDate();

      const calendar = [];
      let week = [];
      let currentDate = new Date(firstDayOfMonth);

      // 填充前面的空白天数
      currentDate.setDate(currentDate.getDate() - firstDayOfWeek);
      for (let i = 0; i < firstDayOfWeek; i++) {
        const dateStr = this.formatDateKey(currentDate);
        week.push({
          date: new Date(currentDate),
          dateStr: dateStr,
          isCurrentMonth: false,
          tasks: this.tasks[dateStr] || []
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 填充当前月份的天数
      currentDate = new Date(firstDayOfMonth);
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = this.formatDateKey(currentDate);
        week.push({
          date: new Date(currentDate),
          dateStr: dateStr,
          isCurrentMonth: true,
          tasks: this.tasks[dateStr] || []
        });
        currentDate.setDate(currentDate.getDate() + 1);

        if (week.length === 7) {
          calendar.push(week);
          week = [];
        }
      }

      // 填充后面的空白天数
      while (week.length < 7) {
        const dateStr = this.formatDateKey(currentDate);
        week.push({
          date: new Date(currentDate),
          dateStr: dateStr,
          isCurrentMonth: false,
          tasks: this.tasks[dateStr] || []
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      if (week.length) calendar.push(week);

      this.calendar = calendar;
    },

    formatDateKey(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    isToday(date) {
      if (!date) return false;
      const today = new Date();
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    },
    viewTasks(date) {
      this.selectedDate = date; // 保持为 Date 对象
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      this.selectedTasks = (this.tasks[dateStr] || []).sort((a, b) => {
        return new Date(a.time) - new Date(b.time); // 按时间升序排列
      });
      this.isDayView = true;
    },
    formatDate(date) {
      if (!date) return "无日期";
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    changeMonth(offset) {
      this.currentMonth += offset;
      if (this.currentMonth > 12) {
        this.currentMonth = 1;
        this.currentYear++;
      } else if (this.currentMonth < 1) {
        this.currentMonth = 12;
        this.currentYear--;
      }
      this.generateCalendar();
    },
    changeYear(offset) {
      this.currentYear += offset;
      this.generateCalendar();
    },
    toggleViewMode() {
      // 切换视图模式
      if (this.isDayView) {
        this.selectedDate = new Date(); // 默认选中当天
      } else {
        this.generateCalendar(); // 切换回月视图时重新生成日历
      }
    },
    formatTime(timeString) {
      if (!timeString) return '';
      const date = new Date(timeString);
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    formatDate(date) {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    handleCreateEvent() {
      if (!this.isLoggedIn) {
        this.isAuthModalVisible = true; // 用户未登录时弹出注册或登录弹窗
      } else {
        this.openForm(false); // 用户已登录时打开新建日程表单
      }
    },
    handleLoginSuccess(userId) {
      this.login(userId); // 更新全局登录状态
      this.isAuthModalVisible = false; // 关闭弹窗
      this.fetchTasks(); // 登录成功后加载任务
    },
    refreshScheduleView() {
      return this.fetchTasks()
        .then(() => {
          if (this.isDayView && this.selectedDate) {
            const dateStr = this.formatDateKey(this.selectedDate);
            this.selectedTasks = this.tasks[dateStr] || [];
          }
        })
        .catch(error => {
          console.error("刷新视图失败：", error);
          throw error; // 重新抛出错误
        });
    },
    closeAuthModal() {
      this.isAuthModalVisible = false;
    },
    openForm(isEditMode) {
      this.isEditMode = isEditMode;
      this.isFormVisible = true;
      this.formData = isEditMode
        ? {
            event_name: "示例事件",
            time: "2025-06-14T10:00",
            priority: "2",
            tags: "示例标签",
          }
        : {
            event_name: "",
            time: "",
            priority: "2",
            tags: "",
          };
    },
    closeForm() {
      this.isFormVisible = false;
    },
    fetchTasks() {
      return backendService.fetchEvents(this.userId)
        .then(data => {
          this.tasks = data;
          this.generateCalendar();
          this.extractUniqueTags(); 
          return data; // 返回处理后的任务数据
        })
    },
    createEvent(eventData) {
      // 确保所有字段都有值
      backendService.createEvent(eventData, this.userId)
        .then(() => {
          window.showMessage("日程创建成功！", 3000, 1, true);
          return this.refreshScheduleView();
        })
        .then(() => {
          this.extractUniqueTags();
        })
        .then(() => {
          this.closeForm();
        })
        .catch((error) => {
          console.error("创建日程失败：", error);
          window.showMessage("日程创建失败：" + error.message, 3000, 1, true);
        });
    },

    updateEvent(task) {
      if (!this.userId || !task.id) {
        console.error("缺少必要信息");
        return;
      }
      // 保持原有时间格式，不转换
      backendService.updateEvent(task, this.userId)
        .then(() => {
          return this.refreshScheduleView();
        })
        .then(() => {
          this.extractUniqueTags();
        })
        .then(() => {
          window.showMessage("日程已更新！", 3000, 1, true);
          this.closeForm();
        })
        .catch(error => {
          console.error("更新日程失败：", error);
          window.showMessage("更新日程失败：" + error.message, 3000, 1, true);
        });
    },

    deleteTask(taskId) {
      if (!confirm("确定要删除该日程吗？")) return;
      backendService.deleteEvent(taskId)
        .then(() => {
          return this.refreshScheduleView();
        })
        .then(() => {
          window.showMessage("日程已删除！", 3000, 1, true);
        })
        .catch(error => {
          console.error("删除日程失败：", error);
          window.showMessage("删除日程失败：" + error.message, 3000, 1, true);
        });
    },
    // 编辑卡片
    editTask(task) {
      this.isEditMode = true;
      this.formData = { 
        id: task.id,
        event_name: task.event_name,
        time: task.time,
        priority: task.priority,
        tags: task.tags
      };
      this.isFormVisible = true;
    },
    // 提取所有唯一标签
    extractUniqueTags() {
      const tags = new Set();
      // 遍历所有日期的任务
      Object.values(this.tasks).forEach(dayTasks => {
        dayTasks.forEach(task => {
          // 确保标签存在且不为空
          if (task.tags && task.tags.trim() !== '') {
            tags.add(task.tags.trim());
          }
        });
      });
      this.uniqueTags = Array.from(tags).sort(); // 转为数组并排序
    },
  
    // 新增方法：根据标签筛选任务
    filterTasksByTag() {
      // 计算属性会自动更新，无需额外操作
      this.$forceUpdate();
    },

    // 定时器功能
    showReminderModal(task) {
      this.selectedTaskForReminder = task;
      this.showReminder = true;
    },
    closeReminderModal() {
      this.showReminder = false;
    }
  },
  mounted() {
    if (this.isLoggedIn) {
      this.fetchTasks(); // 如果已登录，加载任务
    } else {
      this.isAuthModalVisible = true; // 未登录时弹出登录界面
    }

    requestNotificationPermission();
  },
};
</script>

<style scoped>
.schedule-view {
  display: flex;
  height: 100vh;
  overflow: hidden;
  color: white; /* 设置字体为白色 */
}

.content {
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
}

.content.collapsed {
  margin-left: 60px; /* 收起侧边栏时内容向左移动 */
}

.content:not(.collapsed) {
  margin-left: 200px; /* 展开侧边栏时内容向右移动 */
}

.view-controls {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.square-switch {
  position: relative;
  display: inline-block;
  width: 80px; /* 方块宽度 */
  height: 40px; /* 方块高度 */
}

.square-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc; /* 默认背景颜色 */
  color: white; /* 字体颜色 */
  font-size: 14px; /* 字体大小 */
  font-weight: bold; /* 字体加粗 */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.4s;
  border-radius: 8px; /* 圆角 */
}

input:checked + .slider {
  background-color: #2196f3; /* 选中时背景颜色 */
}

.view-label {
  font-size: 12px;
  color: white;
  margin: 0 5px;
}

.year-controls,
.month-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.year-controls span,
.month-controls span {
  margin: 0 10px;
  font-size: 1.5em;
  font-weight: bold;
}

.year-controls button,
.month-controls button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5em;
  cursor: pointer;
}

.weekdays {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: bold;
}

.weekdays span {
  flex: 1;
  text-align: center;
}

.calendar {
  width: 900px;
  border-collapse: collapse;
  margin: 20px 0;
  color: white; /* 表格字体为白色 */
}

.calendar td {
  border: 1px solid #ccc;
  width: 14.28%;
  height: 100px;
  vertical-align: top;
  text-align: left;
  padding: 5px;
}

.calendar .current-day {
  background-color: #000000; /* 背景颜色为黑色 */
  color: rgb(255, 255, 255); /* 字体颜色为白色 */
  font-weight: bold; /* 字体加粗 */
  border: 3px solid rgb(255, 255, 255); /* 白色边框，宽度为3px */
}

.calendar .other-month {
  color: #aaa;
}

.tasks {
  margin: 5px 0 0;
  padding: 0;
  list-style: none;
}

.tasks li {
  font-size: 12px;
  color: white;
}

.day-view {
  text-align: center;
}

.day-view h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.day-view ul {
  list-style: none;
  padding: 0;
}

.day-view li {
  font-size: 1.2em;
  margin-bottom: 5px;
}

button {
  margin-left: 10px;
  padding: 8px 12px;
  font-size: 14px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #1976d2;
}

.day-view button {
  margin: 5px;
  padding: 5px 10px;
  font-size: 14px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.day-view button:hover {
  background-color: #1976d2;
}

.day-view {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.task-time {
  width: 80px;
  font-size: 16px;
  text-align: center;
  color: #ddd;
}

.task-name {
  flex: 1;
  font-size: 18px;
  padding: 0 15px;
  text-align: left;
  word-break: break-word;
}

.task-meta {
  width: 150px;
  font-size: 12px;
  color: #aaa;
  display: flex;
  flex-direction: column;
}

.task-meta span {
  margin: 2px 0;
}

.task-actions {
  width: 120px;
  display: flex;
  justify-content: flex-end;
}

.task-actions button {
  margin: 0 5px;
  padding: 5px 8px;
  font-size: 12px;
}

.day-view h2 {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: #fff;
}

.tag-filter {
  margin-left: 20px;
}

.tag-filter select {
  padding: 8px 12px;
  border-radius: 5px;
  background-color: #333;
  color: white;
  border: 1px solid #555;
}

.task-actions {
  width: 220px; /* 增加宽度以容纳新按钮 */
  display: flex;
  justify-content: flex-end;
}

.task-actions button {
  margin: 0 5px;
  padding: 5px 8px;
  font-size: 12px;
}

/* 提醒按钮特殊样式 */
.task-actions button:nth-child(3) {
  background-color: #f39c12;
}

</style>

