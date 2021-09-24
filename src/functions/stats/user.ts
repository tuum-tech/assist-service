import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';

const NAMESPACE = 'Function: User';

async function getStats(network: string, beginDate: any, endDate: Date, reset: boolean = false) {
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
    const generalUserStats: any = {
        data: {
            freeAPI: 0,
            premiumAPI: 0,
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
                const freeAPICountAll = user.requests.freeEndpoints.all;
                const premiumAPICountAll = user.requests.premiumEndpoints.all;
                generalUserStats.data.freeAPI += freeAPICountAll;
                generalUserStats.data.premiumAPI += premiumAPICountAll;
                generalUserStats.data.numUsers += 1;
                generalUserStats.data.users[user.username] = {
                    freeAPI: freeAPICountAll,
                    premiumAPI: premiumAPICountAll
                };
                if (user.did) {
                    generalUserStats.data.users[user.username].did = user.did;
                }
                if (reset) {
                    user.requests.freeEndpoints.today = 0;
                    user.requests.premiumEndpoints.today = 0;
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
