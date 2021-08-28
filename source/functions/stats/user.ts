import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';

const NAMESPACE = 'Function: User';

/* async function getStats(network: string, beginDate: any, endDate: Date, reset: boolean = false) {
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
    let generalUserStats: any = {
        data: {
            free: {
                today: 0,
                all: 0
            },
            premium: {
                today: 0,
                all: 0
            },
            usersToday: {},
            numUsersToday: 0,
            numUsersAllTime: 0
        },
        error: null
    };
    await conn.models.User.find()
        .select('-password')
        .exec()
        .then((users) => {
            users.map((user) => {
                let freeEndpointsAll = user.requests.freeEndpoints.all;
                let premiumEndpointsAll = user.requests.premiumEndpoints.all;
                generalUserStats.data.free.today += user.requests.freeEndpoints.today;
                generalUserStats.data.free.all += freeEndpointsAll;
                generalUserStats.data.premium.today += user.requests.premiumEndpoints.today;
                generalUserStats.data.premium.all += premiumEndpointsAll;
                generalUserStats.data.numUsersAllTime += 1;
                if (new Date(user.createdAt) >= beginDate && new Date(user.createdAt) < endDate) {
                    generalUserStats.data.numUsersToday += 1;
                    generalUserStats.data.usersToday[user.username] = {
                        free: freeEndpointsAll,
                        premium: premiumEndpointsAll
                    };
                }
                if (reset) {
                    user.requests.freeEndpoints.today = 0;
                    user.requests.premiumEndpoints.today = 0;
                    user.save();
                }
            });
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to retrieve users from the database: ', err);
            generalUserStats.error = err;
        });
    return generalUserStats;
} */

async function getStats(network: string, beginDate: any, endDate: Date, reset: boolean = false) {
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
    let generalUserStats: any = {
        data: {
            freeAPI: 0,
            premiumAPI: 0,
            users: {},
            numUsers: 0
        },
        error: null
    };
    if (beginDate == null) {
        await conn.models.User.find({ createdAt: { $lt: endDate } })
            .select('-password')
            .exec()
            .then((users) => {
                users.map((user) => {
                    let freeAPICountAll = user.requests.freeEndpoints.all;
                    let premiumAPICountAll = user.requests.premiumEndpoints.all;
                    generalUserStats.data.freeAPI += freeAPICountAll;
                    generalUserStats.data.premiumAPI += premiumAPICountAll;
                    generalUserStats.data.numUsers += 1;
                    generalUserStats.data.users[user.username] = {
                        freeAPI: freeAPICountAll,
                        premiumAPI: premiumAPICountAll
                    };
                    if (reset) {
                        user.requests.freeEndpoints.today = 0;
                        user.requests.premiumEndpoints.today = 0;
                        user.save();
                    }
                });
            })
            .catch((err) => {
                logging.error(NAMESPACE, 'Error while trying to retrieve users from the database: ', err);
                generalUserStats.error = err;
            });
    } else {
        await conn.models.User.find({ createdAt: { $gte: beginDate, $lt: endDate } })
            .select('-password')
            .exec()
            .then((users) => {
                users.map((user) => {
                    let freeAPICountAll = user.requests.freeEndpoints.all;
                    let premiumAPICountAll = user.requests.premiumEndpoints.all;
                    generalUserStats.data.freeAPI += freeAPICountAll;
                    generalUserStats.data.premiumAPI += premiumAPICountAll;
                    generalUserStats.data.numUsers += 1;
                    generalUserStats.data.users[user.username] = {
                        freeAPI: freeAPICountAll,
                        premiumAPI: premiumAPICountAll
                    };
                    if (reset) {
                        user.requests.freeEndpoints.today = 0;
                        user.requests.premiumEndpoints.today = 0;
                        user.save();
                    }
                });
            })
            .catch((err) => {
                logging.error(NAMESPACE, 'Error while trying to retrieve users from the database: ', err);
                generalUserStats.error = err;
            });
    }
    return generalUserStats;
}

export default { getStats };
