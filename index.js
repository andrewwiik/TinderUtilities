const rp = require('request-promise');
const _ = require('lodash');
var ObjectID = require('mongodb').ObjectID;
const wait = require('util').promisify(setTimeout);

const getHeaders = () => {
        return  {
        'cache-control': 'no-cache',
        'x-supported-image-formats': 'webp,jpeg',
        'app-session-id': 'REDACTED',
        platform: 'web',
        'user-session-time-elapsed': '66018',
        'X-Auth-Token': 'REDACTED',
        'app-session-time-elapsed': '66049',
        Accept: 'application/json',
        'user-session-id': 'REDACTED',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
        'app-version': '1020800',
        'tinder-version': '2.8.0',
        'persistent-device-id': 'REDACTED',
        Origin: 'https://tinder.com',
        'Sec-Fetch-Mode': 'cors' }
}

const randomBio = async () => {
        try {
                await rp({
                        uri: `https://api.gotinder.com/v2/profile`,
                        method: 'POST',
                        headers: getHeaders(),
                        body: { user: { bio: String(ObjectID()) } },
                        json: true // Automatically parses the JSON string in the response
                });
        } catch (err) {
                return Promise.reject(err);
        }
}

const likeUser = async (user) => {
        try {
                await rp({
                        uri: `https://api.gotinder.com/like/${user.id}?locale=en&s_number=${user.sid}`,
                        headers: getHeaders(),
                        json: true // Automatically parses the JSON string in the response
                });
        } catch (err) {
                return Promise.reject(err);
        }
}

const passUser = async (user) => {
        try {
                await rp({
                        uri: `https://api.gotinder.com/pass/${user.id}?locale=en&s_number=${user.sid}`,
                        headers: getHeaders(),
                        json: true // Automatically parses the JSON string in the response
                });
        } catch (err) {
                return Promise.reject(err);
        }
}

const getUser = async (userId) => {
        try {
                return await rp({
                        uri: `https://api.gotinder.com/user/${userId}?locale=en`,
                        headers: getHeaders(),
                        json: true // Automatically parses the JSON string in the response
                });
        } catch (err) {
                return Promise.reject(err);
        }
}


const delay = function (duration) {
        return function () {
                return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                                resolve();
                        }, duration)
                });
        };
};



let userIds = [];
const run = async () => {
        try {
                let promiseArr = [];
                for (let x = 0; x < 1; x++) {
                        promiseArr.push(rp({
                                uri: 'https://api.gotinder.com/v2/recs/core',
                                headers: getHeaders(),
                                json: true // Automatically parses the JSON string in the response
                        }));
                }

                let users2 = [];
                let results = await Promise.all(promiseArr);
                for (let result of results) {
                        let statusCode = _.get(result, 'meta.status');
                        if (statusCode !== 200) continue;
                        let users = _.get(result, 'data.results');
                        users = users.map((user) => {
                                // console.log(JSON.stringify(user));
                                return {
                                        name: _.get(user, 'user.name'),
                                        id: _.get(user, 'user._id'),
                                        sid: _.get(user, 's_number'),
                                        bio: _.get(user, 'user.bio'),
                                        birth: _.get(user, 'user.birth_date'),
                                        school: _.get(user, 'user.schools[0].name', "")
                                }
                        });
                        users2.push(...users);
                        // userIds.push(...users);
                }
                // userIds = _.uniqBy(userIds, 'id');
                return _.uniqBy(users2, 'id');;
        } catch (err) {
                return Promise.reject(err);
        }
        //console.log(`TOTAL COUNT: ${userIds.length}`);
        // console.log(results[0]);
};


const start = async () => {
        let totalCount = 0;
        while(1) {
                try {
                        let users = await run();
                        if (users.length > 0) console.error(`Got Profiles: ${users.length}`);
                        for (let user of users) {
                                console.log(JSON.stringify(user, null, 2));
                                console.log(',');
                        }
                        totalCount += users.length;
                        let userGroups = _.chunk(users, 1);

                        for (let userGroup of userGroups) {
                                try {
                                        await Promise.all(userGroup.map(async (user) => {
                                                await passUser(user);
                                                await wait(1250);
                                        }));
                                } catch (err) {
                                        console.error(err);
                                }
                        }
                        if (users.length < 6) {
                                await wait(3500);
                        }
                        console.error(`TOTAL COUNT: ${totalCount}`);
                } catch (err) {
                        console.error("Error Happened");
                        console.error(`TOTAL COUNT: ${totalCount}`);
                        await randomBio();
                        await wait(3500);
                        //console.error(err);
                }

                //console.log(`TOTAL COUNT: ${userIds.length}`);
        }

        // let userGroups = _.chunk(userIds, 3);


        // for (let userGroup of userGroups) {
        //         try {
        //                 await Promise.all(userGroup.map(async (user) => {
        //                         await likeUser(user);
        //                 }));
        //         } catch (err) {
        //                 console.log(err);
        //         }
        // }

        // console.log(JSON.stringify(userIds, null, 2));

        // console.log(`TOTAL COUNT: ${userIds.length}`);
}

const bruteforce = async () => {
        for (let x = 0; x < 5; x++) {
                let userId = String(ObjectID());
                console.log(userId);
        }
}

start().then(() => {

}).catch(console.log);
