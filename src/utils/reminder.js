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

/**
 * 设置定时提醒
 * @param {Date} targetTime - 任务的目标时间
 * @param {string} title - 通知标题
 * @param {string} body - 通知内容
 */
export function setReminder(targetTime, title, body) {
  const now = new Date();
  const timeDifference = targetTime - now;

  if (timeDifference > 0) {
    setTimeout(() => {
      sendNotification(title, { body });
    }, timeDifference);
    console.log(`提醒已设置，将在 ${timeDifference / 1000 / 60} 分钟后触发`);
  } else {
    console.log("目标时间已过，无法设置提醒");
  }
}