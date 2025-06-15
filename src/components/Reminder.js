import BackendService from "@/services/BackendService"
import store from "@/store/index.js";

async function checkReminder() {
    const urgentPlan = await checkPlan();
    if (urgentPlan && Math.random() < 0.4){
        window.showMessage('最近的日程：' + urgentPlan,5000,1,false);
    }
    else if (Math.random() < 0.67){
        const message = randomReminder()
        window.showMessage(message, 3000, 1, false);
    }
}

async function checkPlan() {
    if (!store.getters.isLoggedIn)
        return;

    const plans = await BackendService.fetchEvents(store.getters.userId);
    const planKeys = Object.keys(plans).slice(0, 3); // 获取前三个日期键

    let result = "";
    const sortedPlans = planKeys
        .flatMap(key => plans[key])
        .sort((a, b) => a.priority - b.priority || new Date(a.time) - new Date(b.time))
        .slice(0, 3); // 选择优先级最低且日期最近的前三个计划

    sortedPlans.forEach((event, index) => {
        result += `${index + 1}. ${event.event_name} (${event.time}); `;
    });
    return result.trim(); // 返回构成的字符串
}

function randomReminder() {
    const reminders = [
        "记得多喝水！",
        "偶尔站起来放松一下吧！",
        "你今天运动了吗？",
        "今天也是美好的一天",
        "坚持就是胜利！",
        "不要忘记休息哦！",
        "手机静音，专注25分钟试试？",
        "进步再小也是向前，继续！",
        "你已经很棒了，真的。",
        "立刻！马上！动手做5分钟！"
    ];
    return reminders[Math.floor(Math.random() * reminders.length)];
}

export {checkReminder, checkPlan, randomReminder};