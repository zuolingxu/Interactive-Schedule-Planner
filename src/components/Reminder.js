function checkReminder() {
    const urgentPlan = checkPlan();
    if (urgentPlan)
        window.showMessage(urgentPlan,5000,0,true);
    else if (Math.random() < 0.1)
        window.showMessage(randomReminder(), 3000, 0, true);
    console.log("Reminder checked");
}

function checkPlan(){

    return null;
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

export {checkReminder}