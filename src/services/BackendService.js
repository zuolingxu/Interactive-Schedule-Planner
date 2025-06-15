/**
 * 后端服务封装
 * 封装所有与日程管理相关的API调用
 */
class BackendService {
  constructor(baseUrl = 'http://127.0.0.1:5000') {
    this.baseUrl = baseUrl;
  }

  /**
   * 用户登录
   * @param {Object} credentials - 包含用户名和密码的对象
   * @returns {Promise<Object>} 响应数据
   */
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      if (data.message !== '登录成功！') {
        throw new Error(data.message || '登录失败');
      }
      return data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  /**
   * 用户注册
   * @param {Object} credentials - 包含用户名和密码的对象
   * @returns {Promise<Object>} 响应数据
   */
  async register(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      if (data.message !== '用户注册成功！') {
        throw new Error(data.message || '注册失败');
      }
      return data;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的所有日程事件
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} 日程事件数组
   */
  async fetchEvents(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/events/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return this._processEventData(data);
    } catch (error) {
      console.error("获取日程事件失败:", error);
      throw error;
    }
  }

  /**
   * 创建新日程事件
   * @param {Object} eventData - 事件数据
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 响应数据
   */
  async createEvent(eventData, userId) {
    try {
      const processedData = this._prepareEventData(eventData, userId);
      
      const response = await fetch(`${this.baseUrl}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      const data = await response.json();
      if (data.message !== "事件添加成功！") {
        throw new Error(data.message || "创建失败");
      }
      return data;
    } catch (error) {
      console.error("创建日程事件失败:", error);
      throw error;
    }
  }

  /**
   * 更新日程事件
   * @param {Object} eventData - 事件数据
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 响应数据
   */
  async updateEvent(eventData, userId) {
    try {
      if (!userId || !eventData.id) {
        throw new Error("缺少必要信息: 用户ID或事件ID");
      }

      const processedData = this._prepareEventData(eventData, userId);
      
      const response = await fetch(`${this.baseUrl}/events/${eventData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.message !== "事件更新成功！") {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      console.error("更新日程事件失败:", error);
      throw error;
    }
  }

  /**
   * 删除日程事件
   * @param {string} eventId - 事件ID
   * @returns {Promise<Object>} 响应数据
   */
  async deleteEvent(eventId) {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.message !== "事件删除成功！") {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      console.error("删除日程事件失败:", error);
      throw error;
    }
  }

  /**
   * 处理原始事件数据，转换为前端需要的格式
   * @param {Array} events - 原始事件数组
   * @returns {Object} 按日期分组的事件数据
   */
  _processEventData(events) {
    const tasksByDate = {};
    events.forEach(event => {
      if (event.time && event.event_name) {
        const dateKey = event.time.split('T')[0];
        if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
        tasksByDate[dateKey].push({
          id: event.id,
          event_name: event.event_name,
          time: event.time,
          priority: event.priority,
          tags: event.tags
        });
      }
    });
    return tasksByDate;
  }

  /**
   * 准备事件数据，设置默认值
   * @param {Object} eventData - 原始事件数据
   * @param {string} userId - 用户ID
   * @returns {Object} 处理过的事件数据
   */
  _prepareEventData(eventData, userId) {
    return {
      event_name: eventData.event_name || "",
      time: eventData.time || this._formatDefaultTime(),
      priority: eventData.priority || "2",
      tags: eventData.tags || "无",
      user_id: userId
    };
  }

  /**
   * 格式化日期为YYYY-MM-DD
   * @param {Date} date - 日期对象
   * @returns {string} 格式化后的日期字符串
   */
  formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /**
   * 生成默认时间字符串
   * @returns {string} 默认时间字符串
   */
  _formatDefaultTime() {
    return `${this.formatDateKey(new Date())}T00:00:00`;
  }
}

// 导出单例实例
export default new BackendService();