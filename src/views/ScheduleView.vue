<template>
  <div class="schedule-view">
    <Sidebar :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="content" :class="{ collapsed: isSidebarCollapsed }">
      <ParticleBackground />
      <h1>{{ currentYear }}年 {{ currentMonth }}月</h1>
      <table class="calendar">
        <thead>
          <tr>
            <th v-for="day in weekDays" :key="day">{{ day }}</th>
          </tr>
        </thead>
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
      <div v-if="selectedDate" class="task-modal">
        <h2>{{ selectedDate.getFullYear() }}年{{ selectedDate.getMonth() + 1 }}月{{ selectedDate.getDate() }}日的事项</h2>
        <ul>
          <li v-for="(task, index) in selectedTasks" :key="index">{{ task }}</li>
        </ul>
        <button @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import ParticleBackground from "../components/ParticleBackground.vue";

export default {
  name: "ScheduleView",
  components: {
    Sidebar,
    ParticleBackground,
  },
  data() {
    return {
      isSidebarCollapsed: false,
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      weekDays: ["日", "一", "二", "三", "四", "五", "六"],
      calendar: [],
      selectedDate: null,
      selectedTasks: [],
      tasks: {
        // 示例任务数据，实际数据可以从后端获取
        "2025-06-01": ["完成报告", "开会"],
        "2025-06-15": ["参加活动"],
        "2025-06-20": ["提交作业", "健身"],
      },
    };
  },
  methods: {
    generateCalendar() {
      const firstDayOfMonth = new Date(this.currentYear, this.currentMonth - 1, 1);
      const lastDayOfMonth = new Date(this.currentYear, this.currentMonth, 0);
      const firstDayOfWeek = firstDayOfMonth.getDay();
      const daysInMonth = lastDayOfMonth.getDate();

      const calendar = [];
      let week = [];
      let currentDate = new Date(firstDayOfMonth);

      // 填充前面的空白天数
      for (let i = 0; i < firstDayOfWeek; i++) {
        week.push({ date: new Date(currentDate), isCurrentMonth: false, tasks: [] });
        currentDate.setDate(currentDate.getDate() - 1);
      }
      week.reverse();

      // 填充当前月份的天数
      currentDate = new Date(firstDayOfMonth);
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        week.push({
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
      const dateStr = date.toISOString().split("T")[0];
      this.selectedDate = date;
      this.selectedTasks = this.tasks[dateStr] || [];
    },
    closeModal() {
      this.selectedDate = null;
      this.selectedTasks = [];
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
  },
  mounted() {
    this.generateCalendar();
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

.calendar {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  color: white; /* 表格字体为白色 */
}

.calendar th,
.calendar td {
  border: 1px solid #ccc;
  width: 14.28%;
  height: 100px;
  vertical-align: top;
  text-align: left;
  padding: 5px;
}

.calendar .current-day {
  background-color: #000000;
  color: rgb(174, 139, 139);
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

.task-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  color: black; /* 模态框字体为黑色 */
}

.task-modal h2 {
  margin: 0 0 10px;
}

.task-modal button {
  margin-top: 10px;
}
</style>
