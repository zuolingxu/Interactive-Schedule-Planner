import BackendService from "@/services/BackendService"
import store from "@/store/index.js";

let JsonCahe = null;
async function checkReminder() {
    const urgentPlan = await checkPlan();
    if (urgentPlan && Math.random() < 0.4){
        window.showMessage('最近的日程：' + urgentPlan,5000,1,false);
    }
    else if (Math.random() < 0.67){
        const message = await randomReminder()
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
        .filter(event => new Date(event.time) >= new Date()) // 舍弃所有过去事件
        .sort((a, b) => a.priority - b.priority || new Date(a.time) - new Date(b.time)) // 按优先级和时间排序
        .slice(0, 3); // 选择优先级最低且日期最近的前三个计划

    sortedPlans.forEach((event, index) => {
        const eventDate = new Date(event.time);
        const today = new Date();
        const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24)); // 计算相对日期
        let relativeDate
        if (diffDays === 0)
            relativeDate = "今天";
        else if (diffDays === 1)
            relativeDate = "明天";
        else if (diffDays === 2)
            relativeDate = "后天";
        else
            relativeDate = `${diffDays}天后`;
        const hourString = eventDate.getHours(); // 提取小时部分
        result += `${index + 1}. ${relativeDate} ${hourString}点有${event.event_name}要做; `;
    });
    return result.trim(); // 返回构成的字符串
}

async function randomReminder() {
    if (!JsonCahe) {
        JsonCahe = await fetch('/src/assets/message.json').
        then(response => response.json());
    }
    return JsonCahe[Math.floor(Math.random() * JsonCahe.length)];
}

export {checkReminder, checkPlan, randomReminder};