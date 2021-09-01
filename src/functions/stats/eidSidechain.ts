import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';

const NAMESPACE = 'Function: EidSidechain';

async function getTxStats(network: string, beginDate: any, endDate: Date) {
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
    const generalTxesStats: any = {
        data: {
            didTxes: {
                numTxes: 0,
                txes: {}
            }
            // Add in other types of transactions here in the future
        },
        error: null
    };

    // Aggregate did txes
    let createdAtFilter = { $lt: endDate };
    if (beginDate !== null) {
        const greaterThanEqualToFilter = { $gte: beginDate };
        createdAtFilter = { ...createdAtFilter, ...greaterThanEqualToFilter };
    }

    await conn.models.DidTx.aggregate([
        { $match: { createdAt: createdAtFilter } },
        { $group: { _id: '$requestFrom.username', count: { $sum: 1 } } },
        { $project: { _id: 0, username: '$_id', count: '$count' } }
    ])
        .then((result) => {
            for (const r of result) {
                const numTxes = r.count;
                generalTxesStats.data.didTxes.numTxes += numTxes;
                generalTxesStats.data.didTxes.txes[r.username] = numTxes;
            }
        })
        .catch((error) => {
            logging.error(NAMESPACE, 'Error while trying to aggregate TX stats: ', error);
            generalTxesStats.error = error;
        });

    return generalTxesStats;
}

export default { getTxStats };
