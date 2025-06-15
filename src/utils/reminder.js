export function requestNotificationPermission() {
  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("通知权限已授予");
      } else {
        console.log("通知权限被拒绝");
      }
    });
  }
}

export function sendNotification(title, options) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: options.body });
  } else {
    console.log("通知权限未授予，无法发送通知");
  }
}

// 存储所有定时器，以便页面卸载时清理
const timers = new Set();

export function setReminder(targetTime, title, body) {
  const now = new Date();
  const timeDifference = targetTime - now;

  if (timeDifference > 0) {
    const timer = setTimeout(() => {
      sendNotification(title, { body });
      timers.delete(timer);
    }, timeDifference);
    
    timers.add(timer);
    console.log(`提醒已设置，将在 ${Math.round(timeDifference / 1000 / 60)} 分钟后触发`);
    
    // 返回取消函数
    return () => {
      clearTimeout(timer);
      timers.delete(timer);
    };
  } else {
    console.log("目标时间已过，无法设置提醒");
    return null;
  }
}

// 页面卸载时清除所有定时器
window.addEventListener('beforeunload', () => {
  timers.forEach(timer => clearTimeout(timer));
  timers.clear();
});