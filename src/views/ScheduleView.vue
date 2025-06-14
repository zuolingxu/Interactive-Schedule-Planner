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
            <tr v-for="(week, weekIndex) in calendar" :key="weekIndex">
              <td
                v-for="(day, dayIndex) in week"
                :key="dayIndex"
                :class="{ 'current-day': isToday(day.date), 'other-month': !day.isCurrentMonth }"
                @click="viewTasks(day.date)"
              >
                <div class="date">{{ day.date.getDate() }}</div>
                <ul class="tasks">
                  <li v-for="(task, taskIndex) in day.tasks" :key="taskIndex">{{ task }}</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <div class="day-view">
          <h2>{{ selectedDate ? formatDate(selectedDate) : "请选择日期" }}</h2>
          <ul v-if="selectedDate">
            <li v-for="(task, index) in selectedTasks" :key="index">{{ task }}</li>
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
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Sidebar from "../components/Sidebar.vue";
import ParticleBackground from "../components/ParticleBackground.vue";
import ScheduleForm from "../components/ScheduleForm.vue";
import AuthModal from "../components/AuthModal.vue";

export default {
  name: "ScheduleView",
  components: {
    Sidebar,
    ParticleBackground,
    ScheduleForm,
    AuthModal,
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
    };
  },
  computed: {
    ...mapGetters(["isLoggedIn", "userId"]), // 映射 Vuex 的登录状态和用户 ID
  },
  methods: {
    ...mapActions(["login"]), // 映射 Vuex 的 login 方法
    generateCalendar() {
      const firstDayOfMonth = new Date(this.currentYear, this.currentMonth - 1, 1);
      const lastDayOfMonth = new Date(this.currentYear, this.currentMonth, 0);
      const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 调整为周一开始
      const daysInMonth = lastDayOfMonth.getDate();

      const calendar = [];
      let week = [];
      let currentDate = new Date(firstDayOfMonth);

      // 填充前面的空白天数
      currentDate.setDate(currentDate.getDate() - firstDayOfWeek); // 回退到前一个月的最后几天
      for (let i = 0; i < firstDayOfWeek; i++) {
        week.push({ date: new Date(currentDate), isCurrentMonth: false, tasks: [] });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 填充当前月份的天数
      currentDate = new Date(firstDayOfMonth);
      for (let day = 1; day <= daysInMonth; day++) {
          // 生成本地日期字符串（格式：YYYY-MM-DD）
          const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;        week.push({
          date: new Date(currentDate),
          isCurrentMonth: true,
          tasks: this.tasks[dateStr] || [],
        });
        currentDate.setDate(currentDate.getDate() + 1);

        if (week.length === 7) {
          calendar.push(week);
          week = [];
        }
      }

      // 填充后面的空白天数
      while (week.length < 7) {
        week.push({ date: new Date(currentDate), isCurrentMonth: false, tasks: [] });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      if (week.length) calendar.push(week);

      this.calendar = calendar;
    },
    isToday(date) {
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
    this.selectedTasks = this.tasks[dateStr] || [];
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
      fetch(`http://127.0.0.1:5000/events/${this.userId}`)
        .then(response => response.json())
        .then(data => {
          this.tasks = data.reduce((acc, event) => {
            if (event.time && event.event_name) {
              const dateKey = event.time.split('T')[0]; // 直接使用本地时间
              if (!acc[dateKey]) acc[dateKey] = [];
              acc[dateKey].push(event.event_name);
            }
            return acc;
          }, {});
          this.generateCalendar();
        })
        .catch(error => {
          console.error("加载任务失败：", error);
        });
    },
    createEvent(eventData) {
      fetch("http://127.0.0.1:5000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...eventData,
          user_id: this.userId, // 添加当前用户 ID
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "事件添加成功！") {
            alert("日程创建成功！");
            this.fetchTasks(); // 新建成功后重新加载任务
            this.closeForm(); // 关闭表单
          } else {
            alert("日程创建失败：" + data.message);
          }
        })
        .catch((error) => {
          console.error("创建日程失败：", error);
        });
    },
  },
  mounted() {
    if (this.isLoggedIn) {
      this.fetchTasks(); // 如果已登录，加载任务
    } else {
      this.isAuthModalVisible = true; // 未登录时弹出登录界面
    }
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
  width: 100%;
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
</style>
