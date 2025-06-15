<template>
  <div class="helper-page">
    <Sidebar :is-collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />
    <div class="content" :class="{ collapsed: isSidebarCollapsed }">
      <ParticleBackground />
      <div class="focus-container">
        <div class="notification" :class="{ show: showNotification }">
          {{ notificationMessage }}
        </div>

        <button class="history-btn" @click="toggleHistory">
          <i class="fas fa-history"></i>
          <span v-if="focusHistory.length > 0" class="session-count-badge">{{ focusHistory.length }}</span>
        </button>

        <div class="header">
          <h1>专注模式</h1>
          <p>开启专注时光，提升学习效率</p>
        </div>

        <div class="timer-display" :class="timerClass">
          {{ formattedTime }}
        </div>

        <div class="controls">
          <button v-if="!isRunning" @click="startTimer" class="btn btn-primary">
            <i class="fas fa-play"></i> 开始专注
          </button>
          <button v-else @click="pauseTimer" class="btn btn-primary">
            <i class="fas fa-pause"></i> 暂停
          </button>
          <button @click="resetTimer" class="btn btn-secondary">
            <i class="fas fa-redo"></i> {{ isRunning || isPaused ? "结束" : "重置" }}
          </button>
        </div>

        <div class="music-controls">
          <div class="music-row">
            <select v-model="selectedMusic" class="music-select" @change="changeMusic">
              <option value="white-noise">白噪音</option>
              <option value="rain">雨声</option>
              <option value="forest">森林</option>
            </select>
            <button
                class="music-toggle"
                :class="{ active: isMusicPlaying }"
                @click="toggleMusic"
            >
              <i :class="isMusicPlaying ? 'fas fa-volume-up' : 'fas fa-volume-mute'"></i>
            </button>
          </div>
          <div class="volume-control">
            <i class="fas fa-volume-down volume-icon"></i>
            <input
                type="range"
                class="volume-slider"
                min="0"
                max="100"
                v-model="volume"
                @input="changeVolume"
            >
            <i class="fas fa-volume-up volume-icon"></i>
          </div>
        </div>

        <div class="stats">
          <div class="stats-title">专注统计</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ sessionsToday }}</div>
              <div class="stat-label">今日次数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ totalMinutes }}<small>分钟</small></div>
              <div class="stat-label">总专注时间</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ currentStreak }}<small>天</small></div>
              <div class="stat-label">连续专注</div>
            </div>
          </div>
        </div>

        <img src="https://images.duolingo.com/avatars/owl/blue.png" alt="Duo" class="duo-mascot">

        <div class="history-panel" :class="{ open: showHistory }">
          <div class="history-header">
            <h2 class="history-title">专注历史</h2>
            <button @click="toggleHistory" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              关闭
            </button>
          </div>
          <div class="history-list">
            <div v-if="focusHistory.length === 0" class="no-history">
              <i class="fas fa-clock" style="font-size: 48px; margin-bottom: 15px;"></i>
              <p>暂无专注记录</p>
              <p>完成一次专注后，记录将显示在这里</p>
            </div>
            <div v-else>
              <div v-for="(group, date) in groupedHistory" :key="date" class="history-group">
                <div class="history-date">{{ date }}</div>
                <div v-for="(item, index) in group" :key="index" class="history-item">
                  <div class="history-details">
                    <span>{{ formatTime(item.startTime) }} - {{ formatTime(item.endTime) }}</span>
                    <span>{{ Math.floor(item.duration / 60) }} 分钟</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue';
import ParticleBackground from '../components/ParticleBackground.vue';
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

export default {
  components: {
    Sidebar,
    ParticleBackground
  },
  setup() {
    // 初始时间为25分钟（1500秒）
    const totalSeconds = ref(1500);
    const secondsLeft = ref(1500);
    const isRunning = ref(false);
    const isPaused = ref(false);
    const timerInterval = ref(null);
    const showNotification = ref(false);
    const notificationMessage = ref("");
    const showHistory = ref(false);
    const sessionStartTime = ref(null);

    // 专注历史数据
    const focusHistory = ref([]);

    // 音乐相关变量
    const audioPlayer = ref(null);
    const isMusicPlaying = ref(false);
    const selectedMusic = ref("white-noise");
    const volume = ref(50); // 默认音量50%
    const musicSources = {
      "white-noise": "/src/assets/music/white-noise.mp3",
      rain: "/src/assets/music/rain.mp3",
      forest: "/src/assets/music/forest.mp3",
    };

    // 格式化显示时间
    const formattedTime = computed(() => {
      const minutes = Math.floor(secondsLeft.value / 60);
      const seconds = secondsLeft.value % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
    });

    // 计时器状态类
    const timerClass = computed(() => {
      if (!isRunning.value && !isPaused.value) return "";
      if (isRunning.value) return "timer-running";
      if (isPaused.value) return "timer-paused";
      return "";
    });

    // 计算统计信息
    const sessionsToday = computed(() => {
      const today = new Date();
      const todayStr = formatDate(today);
      return focusHistory.value.filter(
          (session) => session.date === todayStr
      ).length;
    });

    const totalMinutes = computed(() => {
      return focusHistory.value.reduce(
          (total, session) => total + Math.floor(session.duration / 60),
          0
      );
    });

    const currentStreak = computed(() => {
      if (focusHistory.value.length === 0) return 0;

      // 获取所有专注日期并排序
      const uniqueDates = [...new Set(focusHistory.value.map((s) => s.date))].sort();

      // 计算连续天数
      let streak = 1;
      let currentDate = new Date(uniqueDates[uniqueDates.length - 1]);

      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const prevDate = new Date(uniqueDates[i]);
        const expectedPrevDate = new Date(currentDate);
        expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);

        if (formatDate(prevDate) === formatDate(expectedPrevDate)) {
          streak++;
          currentDate = prevDate;
        } else {
          break;
        }
      }

      return streak;
    });

    // 按日期分组的历史记录
    const groupedHistory = computed(() => {
      const groups = {};
      focusHistory.value.forEach((session) => {
        const dateStr = formatDisplayDate(session.date);
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(session);
      });
      return groups;
    });

    // 日期格式化函数（YYYY-MM-DD）
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // 显示日期格式化（更友好的格式）
    const formatDisplayDate = (dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (formatDate(date) === formatDate(today)) {
        return "今天";
      } else if (formatDate(date) === formatDate(yesterday)) {
        return "昨天";
      } else {
        return date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }
    };

    // 加载历史数据
    const loadHistory = () => {
      const savedHistory = localStorage.getItem("focusHistory");
      if (savedHistory) {
        focusHistory.value = JSON.parse(savedHistory);
      }
    };

    // 保存历史数据
    const saveHistory = () => {
      localStorage.setItem("focusHistory", JSON.stringify(focusHistory.value));
    };

    // 添加新的专注记录
    const addFocusSession = () => {
      const now = new Date();
      const session = {
        date: formatDate(now),
        startTime: sessionStartTime.value.getTime(),
        endTime: now.getTime(),
        duration: totalSeconds.value - secondsLeft.value,
      };
      focusHistory.value.unshift(session);
      saveHistory();
    };

    // 开始计时（添加音乐自动播放）
    const startTimer = () => {
      if (secondsLeft.value === 0) {
        secondsLeft.value = totalSeconds.value;
      }
      sessionStartTime.value = new Date();
      isRunning.value = true;
      isPaused.value = false;

      // 自动播放音乐（如果未播放）
      if (!isMusicPlaying.value) {
        toggleMusic();
      }

      timerInterval.value = setInterval(() => {
        secondsLeft.value--;
        if (secondsLeft.value <= 0) {
          clearInterval(timerInterval.value);
          isRunning.value = false;
          secondsLeft.value = 0;
          showNotification.value = true;
          notificationMessage.value = "恭喜完成一次专注！";

          // 添加专注记录
          addFocusSession();

          // 5秒后隐藏通知
          setTimeout(() => {
            showNotification.value = false;
          }, 5000);
        }
      }, 1000);
    };

    // 暂停计时
    const pauseTimer = () => {
      clearInterval(timerInterval.value);
      isRunning.value = false;
      isPaused.value = true;
    };

    // 重置计时
    const resetTimer = () => {
      clearInterval(timerInterval.value);
      isRunning.value = false;
      isPaused.value = false;
      secondsLeft.value = totalSeconds.value;

      if (isRunning.value || isPaused.value) {
        showNotification.value = true;
        notificationMessage.value = "专注已结束";
        setTimeout(() => {
          showNotification.value = false;
        }, 3000);
      }
    };

    // 切换历史面板
    const toggleHistory = () => {
      showHistory.value = !showHistory.value;
    };

    // 格式化时间
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    // 音乐控制函数
    const initAudio = () => {
      audioPlayer.value = new Audio(musicSources[selectedMusic.value]);
      audioPlayer.value.loop = true;
      audioPlayer.value.volume = volume.value / 100;
    };

    const toggleMusic = () => {
      isMusicPlaying.value = !isMusicPlaying.value;
      if (isMusicPlaying.value) {
        // 确保音频对象已初始化
        if (
            !audioPlayer.value ||
            audioPlayer.value.src !== musicSources[selectedMusic.value]
        ) {
          initAudio();
        }
        audioPlayer.value.play().catch((e) => console.log("自动播放被阻止:", e));
      } else {
        audioPlayer.value.pause();
      }
    };

    const changeMusic = () => {
      const wasPlaying = isMusicPlaying.value;
      if (wasPlaying) {
        audioPlayer.value.pause();
      }
      initAudio();
      if (wasPlaying) {
        audioPlayer.value.play().catch((e) => console.log("自动播放被阻止:", e));
      }
    };

    const changeVolume = () => {
      if (audioPlayer.value) {
        audioPlayer.value.volume = volume.value / 100;
      }
    };

    // 组件挂载时加载历史数据和初始化音频
    onMounted(() => {
      loadHistory();
      initAudio();
    });

    // 组件卸载时清除定时器和停止音乐
    onBeforeUnmount(() => {
      clearInterval(timerInterval.value);
      if (audioPlayer.value) {
        audioPlayer.value.pause();
      }
    });

    const isSidebarCollapsed = ref(false);

    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value;
    };

    return {
      isSidebarCollapsed,
      toggleSidebar,
      totalSeconds,
      secondsLeft,
      isRunning,
      isPaused,
      formattedTime,
      timerClass,
      showNotification,
      notificationMessage,
      showHistory,
      focusHistory,
      sessionsToday,
      totalMinutes,
      currentStreak,
      groupedHistory,
      startTimer,
      pauseTimer,
      resetTimer,
      toggleHistory,
      formatTime,
      isMusicPlaying,
      selectedMusic,
      volume,
      toggleMusic,
      changeMusic,
      changeVolume,
    };
  },
};
</script>

<style scoped>
/* 侧边栏和内容区域样式 */
.helper-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
  position: relative;
  min-height: 100vh;
}

.content.collapsed {
  margin-left: 60px;
}

.content:not(.collapsed) {
  margin-left: 200px;
}

/* 专注模式容器样式调整 */
.focus-container {
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  padding: 40px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  transform: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content:not(.collapsed) {
    margin-left: 60px;
  }

  .focus-container {
    padding: 30px 20px;
    max-width: 100%;
  }
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Inter", sans-serif;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #6c757d;
}

.focus-container {
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  padding: 40px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  transform: none;
}

h1, h2, h3, p, span, div, button {
  color: #6c757d; /* 统一淡灰色 */
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  color: #6c757d;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.header p {
  color: #adb5bd;
  font-size: 16px;
  max-width: 350px;
  margin: 0 auto;
  line-height: 1.5;
}

.timer-display {
  font-size: 72px;
  font-weight: 600;
  margin: 30px 0;
  color: #6c757d;
  font-feature-settings: "tnum";
  transition: all 0.3s ease;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.btn {
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 160px;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.4);
}

.btn-primary {
  background-color: #58cc02;
  color: white;
  box-shadow: 0 4px 0 #46a302;
}

.btn-primary:hover {
  background-color: #4db802;
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #46a302;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
  box-shadow: 0 4px 0 #d0d0d0;
}

.btn-secondary:hover {
  background-color: #e5e5e5;
  transform: translateY(-2px);
}

.btn-secondary:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #d0d0d0;
}

.stats {
  background-color: #f8f9fa;
  border-radius: 16px;
  padding: 20px;
  margin-top: 20px;
}

.stats-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #3c3c3c;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.7);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #58cc02;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #adb5bd;
}

.notification {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #58cc02;
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 10;
}

.notification.show {
  opacity: 1;
}

.duo-mascot {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 120px;
  opacity: 0.1;
  transform: rotate(15deg);
}

.history-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: #58cc02;
  font-size: 20px;
  cursor: pointer;
}

.history-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 30px;
  z-index: 20;
  transform: translateY(-100%);
  transition: transform 0.4s ease;
  overflow-y: auto;
}

.history-panel.open {
  transform: translateY(0);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-title {
  font-size: 22px;
  font-weight: 700;
  color: #3c3c3c;
}

.history-list {
  text-align: left;
}

.history-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.history-date {
  font-weight: 600;
  margin-bottom: 5px;
  color: #6c757d;
}

.history-details {
  display: flex;
  justify-content: space-between;
  color: #adb5bd;
}

.no-history {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.session-count-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff4b4b;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-controls {
  margin: 25px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.music-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  width: 100%;
}

.music-select {
  padding: 10px 15px;
  border-radius: 12px;
  color: #6c757d;
  border: 2px solid #e0e0e0;
  background: white;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  width: 180px;
  outline: none;
  transition: border-color 0.3s;
}

.music-select:focus {
  border-color: #58cc02;
}

.music-toggle {
  background: #f0f0f0;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
  box-shadow: 0 3px 0 #d0d0d0;
  transition: all 0.2s;
}

.music-toggle:hover {
  transform: translateY(-2px);
}

.music-toggle:active {
  transform: translateY(1px);
  box-shadow: 0 1px 0 #d0d0d0;
}

.music-toggle.active {
  background: #58cc02;
  color: white;
  box-shadow: 0 3px 0 #46a302;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 80%;
  max-width: 300px;
  margin-top: 10px;
}

.volume-icon {
  font-size: 20px;
  color: #666;
  min-width: 24px;
}

.volume-slider {
  flex: 1;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: #e0e0e0;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #58cc02;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #58cc02;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 500px) {
  .timer-display {
    font-size: 60px;
  }
  .btn {
    min-width: 140px;
    padding: 14px 20px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .history-panel {
    padding: 20px 15px;
  }
  .music-controls {
    margin: 15px 0;
  }
}
</style>
