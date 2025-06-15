<!-- VoiceSchedule.vue -->
<template>
  <div class="container">
    <div class="header">
      <i class="fas fa-calendar-alt calendar-icon"></i>
      <h1>语音识别日程创建系统</h1>
      <p>通过语音命令创建日程事件，系统将自动解析时间、日期和事件内容</p>
    </div>

    <div class="voice-section">
      <h2><i class="fas fa-microphone"></i> 语音控制</h2>

      <div class="visualizer">
        <div
            v-for="(bar, index) in bars"
            :key="index"
            class="bar"
            :style="{ height: barHeight(index) + 'px' }"
        ></div>
      </div>

      <div class="voice-controls">
        <button id="startBtn" class="btn primary" @click="startRecognition">
          <i class="fas fa-microphone"></i> 开始语音识别
        </button>
        <button id="stopBtn" class="btn danger" @click="stopRecognition">
          <i class="fas fa-stop"></i> 停止识别
        </button>
      </div>

      <div class="status" :class="statusClass">
        <i v-if="status === 'listening'" class="fas fa-circle-notch fa-spin"></i>
        <i v-else-if="status === 'error'" class="fas fa-exclamation-circle"></i>
        {{ statusMessage }}
      </div>
    </div>

    <div class="result-container">
      <h3><i class="fas fa-comment-dots"></i> 识别结果</h3>
      <div id="result">
        <span v-if="interimTranscript" class="interim">{{ interimTranscript }}</span>
        {{ finalTranscript || "请点击\"开始语音识别\"按钮，说出您的日程安排..." }}
      </div>
    </div>

    <div class="event-preview" v-if="parsedEvent">
      <h3><i class="fas fa-calendar-check"></i> 事件预览</h3>
      <div class="event-details">
        <div class="detail-item">
          <div class="detail-label">事件标题</div>
          <div class="detail-value">{{ parsedEvent.title }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">日期</div>
          <div class="detail-value">{{ parsedEvent.date }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">开始时间</div>
          <div class="detail-value">{{ parsedEvent.startTime }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">结束时间</div>
          <div class="detail-value">{{ parsedEvent.endTime }}</div>
        </div>
      </div>
      <div class="actions">
        <button id="createEventBtn" class="btn secondary" @click="createEvent" :disabled="isCreating">
          <i v-if="isCreating" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-plus-circle"></i>
          {{ isCreating ? '创建中...' : '创建日程' }}
        </button>
        <button id="cancelBtn" class="btn danger" @click="cancelPreview">
          <i class="fas fa-times"></i> 取消
        </button>
      </div>
    </div>

    <div class="example-commands">
      <h4><i class="fas fa-lightbulb"></i> 示例命令：</h4>
      <ul>
        <li>"明天下午3点开会"</li>
        <li>"下周二上午10点到11点团队会议"</li>
        <li>"11月15日下午2点到4点项目评审"</li>
        <li>"周五早上9点30分与客户通话"</li>
      </ul>
    </div>

    <div class="footer">
      <p><i class="fas fa-info-circle"></i> 提示：请在安静环境中使用，清晰发音以获得最佳效果</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoiceSchedule',
  data() {
    return {
      recognition: null,
      finalTranscript: '',
      interimTranscript: '',
      status: '', // '', 'listening', 'error'
      statusMessage: '',
      bars: Array(10).fill(0),
      parsedEvent: null,
      isCreating: false,
      visualizerInterval: null,
      baseUrl: "http://113.44.8.72"
    };
  },
  computed: {
    statusClass() {
      return {
        'status': true,
        'listening': this.status === 'listening',
        'error': this.status === 'error'
      };
    }
  },
  mounted() {
    this.loadFontAwesome();
    this.initSpeechRecognition();
  },
  beforeUnmount() {
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.visualizerInterval) {
      clearInterval(this.visualizerInterval);
    }
  },
  methods: {
    loadFontAwesome() {
      // 检查是否已加载
      if (document.querySelector('link[href*="font-awesome"]')) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(link);
    },

    initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        this.finalTranscript = "您的浏览器不支持语音识别功能，请尝试使用最新版Chrome浏览器";
        return;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'zh-CN';

      // 语音识别开始
      this.recognition.onstart = () => {
        this.status = 'listening';
        this.statusMessage = '正在聆听...请说出您的日程安排';
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.startVisualizer();
      };

      // 处理识别结果
      this.recognition.onresult = (event) => {
        this.interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.finalTranscript += transcript;
            this.parseSpeechResult(this.finalTranscript);
          } else {
            this.interimTranscript += transcript;
          }
        }
      };

      // 错误处理
      this.recognition.onerror = (event) => {
        console.error("识别错误:", event.error);
        this.status = 'error';
        this.statusMessage = `识别错误: ${event.error}`;
      };

      // 识别结束
      this.recognition.onend = () => {
        this.status = '';
        this.statusMessage = '';
        this.stopVisualizer();
      };
    },

    startRecognition() {
      if (!this.recognition) this.initSpeechRecognition();

      try {
        this.recognition.start();
      } catch (error) {
        console.error("启动失败:", error);
        this.status = 'error';
        this.statusMessage = "启动失败，请检查麦克风权限";
      }
    },

    stopRecognition() {
      if (this.recognition) {
        this.recognition.stop();
      }
    },

    startVisualizer() {
      if (this.visualizerInterval) {
        clearInterval(this.visualizerInterval);
      }

      this.visualizerInterval = setInterval(() => {
        this.bars = this.bars.map(() => Math.floor(Math.random() * 80) + 10);
      }, 150);
    },

    stopVisualizer() {
      if (this.visualizerInterval) {
        clearInterval(this.visualizerInterval);
        this.visualizerInterval = null;
        this.bars = Array(10).fill(0);
      }
    },

    barHeight(index) {
      return this.status === 'listening' ? this.bars[index] : 0;
    },

    parseSpeechResult(text) {
      // 在实际应用中，这里应该使用更复杂的NLP处理
      const today = new Date();

      // 提取时间信息
      const timePattern = /(\d{1,2})[:：点](\d{0,2})?/;
      const timeMatch = text.match(timePattern);

      // 提取日期信息
      let eventDate = today;
      let eventTitle = text;

      // 简化处理日期
      if (text.includes('明天')) {
        eventDate = new Date(today);
        eventDate.setDate(today.getDate() + 1);
        eventTitle = eventTitle.replace('明天', '');
      } else if (text.includes('后天')) {
        eventDate = new Date(today);
        eventDate.setDate(today.getDate() + 2);
        eventTitle = eventTitle.replace('后天', '');
      } else if (text.includes('下周')) {
        eventDate = new Date(today);
        eventDate.setDate(today.getDate() + 7);
        eventTitle = eventTitle.replace('下周', '');
      }

      // 处理时间
      let startTime = "10:00";
      let endTime = "11:00";

      if (timeMatch) {
        const hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;

        startTime = `${hour}:${minute.toString().padStart(2, '0')}`;
        endTime = `${hour + 1}:${minute.toString().padStart(2, '0')}`;

        // 从标题中移除时间部分
        eventTitle = eventTitle.replace(timeMatch[0], '').trim();
      }

      // 创建预览对象
      this.parsedEvent = {
        title: eventTitle || '未命名事件',
        date: this.formatDate(eventDate),
        startTime: startTime,
        endTime: endTime
      };
    },

    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    async createEvent() {
      if (!this.parsedEvent) return;

      try {
        this.isCreating = true;

        // 获取当前用户ID（实际应用中应从认证系统获取）
        const userId = "current_user_id"; // 替换为实际用户ID

        // 准备事件数据
        const eventData = {
          title: this.parsedEvent.title,
          start: `${this.parsedEvent.date}T${this.parsedEvent.startTime}:00`,
          end: `${this.parsedEvent.date}T${this.parsedEvent.endTime}:00`,
          description: "通过语音识别创建的事件"
        };

        // 调用后端服务创建事件
        const response = await fetch(`${this.baseUrl}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...eventData,
            userId
          }),
        });

        const data = await response.json();

        if (data.message !== "事件添加成功！") {
          throw new Error(data.message || "创建失败");
        }

        this.status = 'listening';
        this.statusMessage = '日程创建成功！';

        // 重置界面
        setTimeout(() => {
          this.finalTranscript = '';
          this.interimTranscript = '';
          this.parsedEvent = null;
          this.isCreating = false;
          this.status = '';
          this.statusMessage = '';
        }, 2000);

      } catch (error) {
        console.error("创建日程事件失败:", error);
        this.status = 'error';
        this.statusMessage = `创建失败: ${error.message}`;
        this.isCreating = false;
      }
    },

    cancelPreview() {
      this.parsedEvent = null;
      this.finalTranscript = '';
      this.interimTranscript = '';
    }
  }
};
</script>

<style scoped>
/* 这里复制原文件中的所有CSS样式 */
:global(:root) {
  --primary: #4e6ef2;
  --primary-dark: #3a56d1;
  --secondary: #58cc02;
  --light: #f8f9fa;
  --dark: #333;
  --gray: #6c757d;
  --success: #28a745;
  --danger: #dc3545;
  --warning: #ffc107;
  --card-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background: linear-gradient(135deg, #f0f5ff, #e6f7ff);
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--dark);
}

.container {
  background: white;
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  width: 90%;
  max-width: 700px;
  padding: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.header {
  margin-bottom: 30px;
  position: relative;
}

.header h1 {
  color: var(--primary);
  font-size: 32px;
  margin-bottom: 15px;
  font-weight: 700;
}

.header p {
  color: var(--gray);
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.calendar-icon {
  position: absolute;
  top: -20px;
  right: -10px;
  color: var(--secondary);
  font-size: 64px;
  opacity: 0.15;
  z-index: 0;
}

.voice-section {
  background: #f8f9ff;
  border-radius: 16px;
  padding: 30px;
  margin: 30px 0;
  position: relative;
  border: 1px solid #e0e7ff;
}

.voice-section h2 {
  color: var(--primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.voice-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 25px 0;
}

.btn {
  border: none;
  border-radius: 50px;
  padding: 14px 30px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn.primary {
  background: var(--primary);
  color: white;
}

.btn.primary:hover {
  background: var(--primary-dark);
}

.btn.secondary {
  background: var(--secondary);
  color: white;
}

.btn.secondary:hover {
  background: #46a302;
}

.btn.danger {
  background: var(--danger);
  color: white;
}

.btn.danger:hover {
  background: #bd2130;
}

.visualizer {
  height: 100px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  margin: 20px 0;
}

.bar {
  width: 10px;
  background: var(--primary);
  border-radius: 5px 5px 0 0;
  transition: height 0.2s ease;
}

.result-container {
  background: #f9f9f9;
  border-radius: 16px;
  padding: 25px;
  margin-top: 30px;
  min-height: 150px;
  text-align: left;
  position: relative;
  border: 1px dashed #e0e0e0;
}

.result-container h3 {
  color: var(--primary);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
}

#result {
  font-size: 18px;
  line-height: 1.6;
  color: #444;
  min-height: 50px;
  padding: 10px 0;
}

.interim {
  color: #888;
  font-style: italic;
}

.status {
  margin-top: 20px;
  padding: 15px;
  border-radius: 12px;
  font-weight: 600;
  display: none;
  text-align: center;
}

.status.listening {
  background: rgba(88, 204, 2, 0.1);
  color: var(--success);
  display: block;
}

.status.error {
  background: rgba(220, 53, 69, 0.1);
  color: var(--danger);
  display: block;
}

.event-preview {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-top: 30px;
  border-left: 4px solid var(--primary);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: none;
}

.event-preview h3 {
  color: var(--primary);
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.event-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 15px 0;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 14px;
  color: var(--gray);
  margin-bottom: 5px;
}

.detail-value {
  font-size: 16px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.footer {
  margin-top: 30px;
  color: var(--gray);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.example-commands {
  background: #f0f7ff;
  border-radius: 12px;
  padding: 15px;
  margin-top: 15px;
  text-align: left;
}

.example-commands h4 {
  color: var(--primary);
  margin-bottom: 10px;
}

.example-commands ul {
  padding-left: 20px;
}

.example-commands li {
  margin-bottom: 8px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .container {
    padding: 30px 20px;
    width: 95%;
  }

  .voice-controls {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .event-details {
    grid-template-columns: 1fr;
  }
}
</style>
