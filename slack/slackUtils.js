require('dotenv').config()
const {IncomingWebhook} = require('@slack/webhook');
const hostname = process.env.HOST_NAME;
const url = process.env.SLACK_WEBHOOK_URL;//slack webhook url
const webhook = new IncomingWebhook(url);
const progress_name = process.env.PROGRESS_NAME;//docker名称

const taskTimeMap = new Map();//存储每个任务上次告警时间


//task:任务名称
//data:告警内容,如果为空，则代表启动或者重启
async function slackUtils(task, message) {
    let now = (new Date().getTime() - new Date().getMilliseconds()) / 1000
    if (taskTimeMap.get(task) === undefined || now - taskTimeMap.get(task) >= 900) {//相同告警间隔15分钟
        try {
            if (message === undefined) {
                await webhook.send(
                    {
                        text: ":sweat_drops::fire::sweat_drops::fire::sweat_drops:" + "\n" + 'host: ' + hostname + '\n' + 'progress: ' + progress_name + '\n' + "start/restart",
                    }
                )
            } else {
                await webhook.send(
                    {
                        text: ":sweat_drops::fire::sweat_drops::fire::sweat_drops:" + "\n" + 'host: ' + hostname + '\n' + 'progress: ' + progress_name + '\n' + message,
                    })
            }
            taskTimeMap.set(task, now);//更新任务告警时间
        } catch (e) {
            console.error('[slackUtils][ts]slack send failed:', e.message);
        }
    }
}

exports.slackUtils = async (task, message) => {
    await slackUtils(task, message);
}

//Demo
//await require("slack/slackUtils").slackUtils('resetHashDispatch', err.message);//异常告警
//await require("slack/slackUtils").slackUtils('start/restart');//重启
//curl -X POST -H 'Content-type: application/json' --data '{"text":"Notify:\n  :打雷::打雷::打雷::向右: Ercot price limit value has changed FROM '$1'  TO  '$2'.\n "}'  $SlackHook