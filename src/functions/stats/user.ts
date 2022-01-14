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

    try {
        // Aggregate users info
        let createdAtFilter = { $lt: endDate };
        if (beginDate !== null) {
            const greaterThanEqualToFilter = { $gte: beginDate };
            createdAtFilter = { ...createdAtFilter, ...greaterThanEqualToFilter };
        }

        const users = await conn.User.find({ createdAt: createdAtFilter }).select('-password').select('-balance').select('-orderId').exec();
        users.map((user: any) => {
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
            if (reset === true && (user.accountType === config.user.premiumAccountType || network === config.blockchain.testnet)) {
                user.requests.today = 0;
                const isLastDay = (dt: Date) => {
                    const test = new Date(dt.getTime());
                    test.setDate(test.getDate() + 1);
                    return test.getDate() === 1;
                };
                if (network === config.blockchain.testnet || isLastDay(endDate) === true) {
                    user.requests.exhaustedQuota = 0;
                }
                user.save();
            }
        });
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to get aggregate users: ', error);

        generalUserStats.error = error;
    }

    return generalUserStats;
}

export default { getStats };
