var jsonFile = require('jsonfile')
const OctoKit = require('octokit')
const fileName = './config/config.json' //配置文件目录
let CronJob = require('cron').CronJob;


//待解决，时区，心跳

//启动，重启 slack 通知
//await require("slack/slackUtils").slackUtils('start/restart');
new CronJob('*/60 * * * *', async () => {
    let configArray = [];
    let jsonData = await jsonFile.readFile(fileName);
    for (let i = 0; i < jsonData['response'].length; ++i) {
        let coin = jsonData['response'][i].name;
        let owner = jsonData['response'][i].owner
        let repo = jsonData['response'][i].repo
        configArray.push({coin: coin, owner: owner, repo: repo})
    }

    let octokit = new OctoKit.Octokit();
    let coinArray = [];
    for (let x of configArray) {
        let result;
        try {
            result = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
                owner: x.owner,
                repo: x.repo
            })
            let tag_name = result.data.tag_name;
            let html_url = result.data.html_url;
            let created_at = result.data.created_at;
            let published_at = result.data.published_at;
            coinArray.push({
                coin: x.coin,
                tag_name: tag_name,
                html_url: html_url,
                github_created: new Date(created_at),
                github_published: new Date(published_at)
            });

        } catch (e) {
            console.warn(e.message)
            //API rate limit exceeded for 47.57.190.158. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.
        }

    }

    if (coinArray.length === 0) {
        console.warn("git error");
        //判断如果是api限制，则停止一段时间
    } else {
        let coinInsertArray = []
        let coinUpdateArray = []
        for (const x of coinArray) {
            let sql = "SELECT coin,tag_name,html_url,github_created,github_published from dog where coin=\'" + x.coin + "\'";
            let result = await require('./database/sqlUtils').queryRecord(sql);

            if (result.length === 0) {//第一次出现，插入
                coinInsertArray.push(x);
            } else {
                if (result[0].tag_name === x.tag_name && x.github_created.toString() === result[0].github_created.toString() && result[0].github_published.toString() === x.github_published.toString()
                    && result[0].html_url === x.html_url) {
                    console.log("相同")
                    //忽略，
                } else {
                    coinUpdateArray.push(x);
                }
            }
        }
        //INSERT INTO hash_slice_day(day,order_id,hash) VALUES(?,?,?) ON DUPLICATE KEY UPDATE hash = ?'
        //方式一、插入
        //insert into dog (coin,tag_name,html_url,github_created,github_published) VALUES('zen','v4.0','https://www.baidu.com','2012-08-21','2012-09-25') ON DUPLICATE KEY UPDATE coin='zen';
        for (let coinMessage of coinInsertArray) {
            //版本更新报警
            //await require("slack/slackUtils").slackUtils('resetHashDispatch','Version update of '+coinMessage.coin )

            let insert_sql = 'INSERT INTO dog (coin,tag_name,html_url,github_created,github_published) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE coin=?';
            await require('./database/sqlUtils').upsertRecord(insert_sql, [coinMessage.coin, coinMessage.tag_name, coinMessage.html_url,
                coinMessage.github_created, coinMessage.github_published, coinMessage.coin]);
        }
        //方式二、更新
        //update dog set coin='zen',tag_name='v4.0',html_url='https://www.baidu.com',github_created='2012-08-21',github_published='2012-09-25' where coin='zen'
        //update dog set coin=?,tag_name=?,html_url=?,github_created=?,github_published=? where coin=?
        for (let coinMessage of coinUpdateArray) {
            let update_sql = 'UPDATE dog SET coin=?,tag_name=?,html_url=?,github_created=?,github_published=? WHERE coin=?'
            await require('./database/sqlUtils').upsertRecord(update_sql, [coinMessage.coin, coinMessage.tag_name, coinMessage.html_url,
                coinMessage.github_created, coinMessage.github_published, coinMessage.coin]);
        }
    }
}, null, true, 'UTC');


