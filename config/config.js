var jsonFile = require('jsonfile')
const OctoKit = require('octokit')
const fileName = './config.json' //配置文件目录



jsonFile.readFile(fileName, async function (err, jsonData) {
    if (err) throw err;
    let octokit = new OctoKit.Octokit();

    for (var i = 0; i < jsonData['response'].length; ++i) {
        let coin = jsonData['response'][i].name
        let owner = jsonData['response'][i].owner
        let repo = jsonData['response'][i].repo

        let result = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
            owner: owner,
            repo: repo
        })
        let tag_name = result.data.tag_name;
        let html_url = result.data.html_url;
        let created_at = result.data.created_at;
        let published_at = result.data.published_at;

        console.log(result.data)
    }
});
//重启，添加slack 告警

schedule.scheduleJob(rule, () => {
    jsonFile.readFile(fileName, async function (err, jsonData) {
            if (err) throw err;
            let octokit = new OctoKit.Octokit();

            for (var i = 0; i < jsonData['response'].length; ++i) {
                let coin = jsonData['response'][i].name
                let owner = jsonData['response'][i].owner
                let repo = jsonData['response'][i].repo

                let result = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
                    owner: owner,
                    repo: repo
                })
                let tag_name = result.data.tag_name;
                let html_url = result.data.html_url;
                let created_at = result.data.created_at;
                console.log(coin, tag_name, html_url, created_at)

                //去数据库拿一下最新的数据，比较是否有变化
                //1、有变化，更新数据库，发slack告警
                //2、无变化，
                //3、心跳


            }


        }
    );
});


/*
//console.log(jsonData)
    for (var i = 0; i < jsonData.response.length; ++i) {
        /!*        console.log("Emp ID: "+jsonData.response[i].name);
                console.log("Emp Name: "+jsonData.response[i].url);
                console.log("Emp Address: "+jsonData.response[i].interval);*!/

        let octokit = new OctoKit.Octokit();
        let a =await octokit.request('GET ' + jsonData.response[i].url)
        if (i=1){
            console.log(a)
        }



    }


    //     console.log("----------------------------------");

});

*/
