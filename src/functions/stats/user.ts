import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';

const NAMESPACE = 'Function: User';

async function getStats(network: string, beginDate: any, endDate: Date, reset: boolean = false) {
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
    const generalUserStats: any = {
        data: {
            requests: {
                today: 0,
                all: 0,
                exhaustedQuota: 0
            },
            users: {},
            numUsers: 0
        },
        error: null
    };

    // Aggregate users info
    let createdAtFilter = { $lt: endDate };
    if (beginDate !== null) {
        const greaterThanEqualToFilter = { $gte: beginDate };
        createdAtFilter = { ...createdAtFilter, ...greaterThanEqualToFilter };
    }

    await conn.models.User.find({ createdAt: createdAtFilter })
        .select('-password')
        .select('-balance')
        .select('-orderId')
        .exec()
        .then((users) => {
            users.map((user) => {
                const countToday = user.requests.today;
                const countAll = user.requests.all;
                const exhaustedQuota = user.requests.exhaustedQuota;
                generalUserStats.data.requests.today += countToday;
                generalUserStats.data.requests.all += countAll;
                generalUserStats.data.requests.exhaustedQuota += exhaustedQuota;
                generalUserStats.data.numUsers += 1;
                generalUserStats.data.users[user.username] = {
                    today: countToday,
                    all: countAll,
                    exhaustedQuota
                };
                if (user.did) {
                    generalUserStats.data.users[user.username].did = user.did;
                }
                if (reset === true && user.accountType === config.user.premiumAccountType) {
                    user.requests.today = 0;
                    const isLastDay = (dt: Date) => {
                        const test = new Date(dt.getTime());
                        test.setDate(test.getDate() + 2);
                        return test.getDate() === 1;
                    };
                    if (isLastDay(endDate) === true) {
                        user.requests.exhaustedQuota = 0;
                    }
                    user.save();
                }
            });
        })
        .catch((error) => {
            logging.error(NAMESPACE, 'Error while trying to retrieve users from the database: ', error);
            generalUserStats.error = error;
        });

    return generalUserStats;
}

export default { getStats };
