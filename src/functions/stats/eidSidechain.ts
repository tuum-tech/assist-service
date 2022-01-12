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

    await conn.DidTx.aggregate([{ $match: { createdAt: createdAtFilter } }, { $group: { _id: '$requestFrom', count: { $sum: 1 } } }, { $project: { _id: 0, requestFrom: '$_id', count: '$count' } }])
        .then((result: any) => {
            for (const r of result) {
                const numTxes = r.count;
                generalTxesStats.data.didTxes.numTxes += numTxes;
                if (generalTxesStats.data.didTxes.txes.hasOwnProperty(r.requestFrom.username) && generalTxesStats.data.didTxes.txes[r.requestFrom.username].hasOwnProperty('numTxes')) {
                    generalTxesStats.data.didTxes.txes[r.requestFrom.username].numTxes += numTxes;
                } else {
                    generalTxesStats.data.didTxes.txes[r.requestFrom.username] = {
                        numTxes
                    };
                }
                if (r.requestFrom.did) {
                    generalTxesStats.data.didTxes.txes[r.requestFrom.username][r.requestFrom.did] = numTxes;
                }
            }
        })
        .catch((error) => {
            logging.error(NAMESPACE, '', 'Error while trying to aggregate TX stats: ', error);
            generalTxesStats.error = error;
        });

    return generalTxesStats;
}

export default { getTxStats };
